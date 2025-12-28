package com.neurofleetx.ml;

import com.neurofleetx.model.ModelMetrics;
import com.neurofleetx.repository.ModelMetricsRepository;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import smile.data.DataFrame;
import smile.data.formula.Formula;
import smile.data.type.StructType;
import smile.io.Read;
import smile.regression.RandomForest;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class ETAPredictionService {
    
    @Autowired
    private ModelMetricsRepository modelMetricsRepository;
    
    private Object model;
    private final Map<String, Integer> weatherEncoding = new HashMap<>();
    private final Map<String, Integer> timeOfDayEncoding = new HashMap<>();
    private boolean modelLoaded = false;
    
    public ETAPredictionService() {
        initializeEncodings();
    }
    
    private void initializeEncodings() {
        weatherEncoding.put("sunny", 0);
        weatherEncoding.put("cloudy", 1);
        weatherEncoding.put("rainy", 2);
        weatherEncoding.put("snowy", 3);
        timeOfDayEncoding.put("morning", 0);
        timeOfDayEncoding.put("afternoon", 1);
        timeOfDayEncoding.put("evening", 2);
        timeOfDayEncoding.put("night", 3);
    }
    
    public void trainModel(String csvFilePath) throws IOException {
        List<double[]> features = new ArrayList<>();
        List<Double> labels = new ArrayList<>();

        // Load and preprocess data
        Path path = Paths.get(csvFilePath);
        try (BufferedReader reader = Files.newBufferedReader(path, StandardCharsets.UTF_8);
             CSVParser csvParser = new CSVParser(reader, CSVFormat.DEFAULT.withFirstRecordAsHeader())) {


            int total = 0, valid = 0;
            for (CSVRecord record : csvParser) {
                total++;
                PreprocessedRow row = preprocessRecord(record);
                if (row != null) {
                    features.add(row.features);
                    labels.add(row.label);
                    valid++;
                }
            }
            System.out.println("Parsed " + valid + "/" + total + " valid rows");
        }


        if (features.size() < 20) {
            throw new IllegalArgumentException("Only " + features.size() + " valid rows - need 20+");
        }

        System.out.println("Training with " + features.size() + " samples");

        int n = features.size();
        double[][] data = new double[n][7];  // 6 features + y
        for (int i = 0; i < n; i++) {
            System.arraycopy(features.get(i), 0, data[i], 0, 6);
            data[i][6] = labels.get(i);
        }

        String[] schema = {"distance", "trafficIndex", "weatherEncoded", "timeOfDayEncoded",
                "batteryLevel", "speed", "y"};

        DataFrame fullData = DataFrame.of(data, schema);
        System.out.println("DataFrame created: " + fullData.size() + " rows");

        // Manual 80/20 split (no DataFrame.split())
        int trainSize = (int) (n * 0.8);
        double[][] XTrainData = new double[trainSize][7];

        double[][] XTestData = new double[n - trainSize][7];



        List<Integer> indices = new ArrayList<>();
        for (int i = 0; i < n; i++) indices.add(i);
        Collections.shuffle(indices, new Random(42));

        for (int i = 0; i < n; i++) {
            int idx = indices.get(i);
            if (i < trainSize) {
                System.arraycopy(data[idx], 0, XTrainData[i], 0, 7);


            } else {
                System.arraycopy(data[idx], 0, XTestData[i - trainSize], 0, 7);


            }
        }

        DataFrame trainData = DataFrame.of(XTrainData, schema);



        DataFrame testData = DataFrame.of(XTestData, schema);


        System.out.println("Train DataFrame: " + trainData.size() + " rows");


        Formula formula = Formula.lhs("y");
        model = RandomForest.fit(formula, trainData);


        double[] trainPred = ((smile.regression.RandomForest) model).predict(trainData);
        double[] testPred  = ((smile.regression.RandomForest) model).predict(testData);


        double[] yTrainActual = trainData.column("y").toDoubleArray();
        double[] yTestActual  = testData.column("y").toDoubleArray();




        double trainR2 = calculateR2(yTrainActual, trainPred);
        double testR2 = calculateR2(yTestActual, testPred);
        double trainMAE = calculateMAE(yTrainActual, trainPred);
        double testMAE = calculateMAE(yTestActual, testPred);
        double trainRMSE = calculateRMSE(yTrainActual, trainPred);
        double testRMSE = calculateRMSE(yTestActual, testPred);
        System.out.println("Training COMPLETE! Test R²=" + testR2);
        // Save metrics
        ModelMetrics metrics = new ModelMetrics();
        metrics.setR2(testR2);        // Test R²
        metrics.setRmse(testRMSE);    // Test RMSE
        metrics.setMae(testMAE);      // Test MAE
        metrics.setTrainR2(trainR2);  // Train R²
        metrics.setTrainRmse(trainRMSE); // Train RMSE
        metrics.setTrainMae(trainMAE);   // Train MAE
        metrics.setTrainedAt(LocalDateTime.now());
        modelMetricsRepository.save(metrics);

        // Save best model only
        Optional<ModelMetrics> best = modelMetricsRepository.findTopByOrderByRmseAsc();
        if (best.isEmpty() || testRMSE <= best.get().getRmse()) {
            saveModel();
        }

        System.out.printf("Train R²=%.3f, Test R²=%.3f, Test RMSE=%.2f%n", trainR2, testR2, testRMSE);
        modelLoaded = true;
    }
    
    private PreprocessedRow preprocessRecord(CSVRecord record) {
        try {
            // Fix column name mismatches - handle both snake_case and camelCase
            String weatherCol = record.isMapped("weather") ? "weather" : null;
            String timeOfDayCol = record.isMapped("time_of_day") ? "time_of_day" : null;

            if (weatherCol == null || timeOfDayCol == null) {
                System.out.println("Missing required columns: weather/time_of_day");
                return null;
            }

            String weather = record.get(weatherCol).trim().toLowerCase();
            String timeOfDay = record.get(timeOfDayCol).trim().toLowerCase();

            if (weather.isEmpty() || timeOfDay.isEmpty()) return null;

            double originLat = Double.parseDouble(record.get("origin_lat"));
            double originLng = Double.parseDouble(record.get("origin_lng"));
            double destLat = Double.parseDouble(record.get("dest_lat"));
            double destLng = Double.parseDouble(record.get("dest_lng"));
            double distanceCsv = Double.parseDouble(record.get("distance"));
            double trafficIndex = Double.parseDouble(record.get("traffic_index"));
            double batteryLevel = Double.parseDouble(record.get("battery_level"));
            double speed = Double.parseDouble(record.get("speed"));

            // Handle both 'trip_time' and 'y' column names
            String targetCol = record.isMapped("trip_time") ? "trip_time" : "y";
            double tripTime = Double.parseDouble(record.get(targetCol));

            // Validation - more lenient for your dataset
            if (distanceCsv < 0 || trafficIndex < 0 || batteryLevel < 0 || batteryLevel > 120 ||  // Allow slight over 100%
                    speed < 0 || tripTime <= 0 || tripTime > 1000) {  // Allow longer trips
                return null;
            }

            double distanceComputed = calculateDistance(originLat, originLng, destLat, destLng);
            double distance = Math.abs(distanceComputed - distanceCsv) > 1.0 ? distanceComputed : distanceCsv;

            int weatherEncoded = weatherEncoding.getOrDefault(weather, 0);
            int timeOfDayEncoded = timeOfDayEncoding.getOrDefault(timeOfDay, 0);

            // EXACT feature order matching FEATURE_NAMES
            return new PreprocessedRow(new double[]{
                    distance, trafficIndex, (double) weatherEncoded, (double) timeOfDayEncoded,
                    batteryLevel, speed
            }, tripTime);
        } catch (Exception e) {
            System.err.println("Parse error: " + e.getMessage());
            return null;
        }
    }


    private static class PreprocessedRow {
        final double[] features;
        final double label;
        PreprocessedRow(double[] features, double label) {
            this.features = features;
            this.label = label;
        }
    }
    
    public double predictETA(double originLat, double originLng, double destLat, double destLng,
                             double trafficIndex, String weather, String timeOfDay) {
        if (!modelLoaded) {
            // If no model is loaded, try to load it, but return a default value if it fails
            try {
                loadModel();
            } catch (Exception e) {
                System.out.println("No trained model found, using default ETA: " + e.getMessage());
                // Return a default ETA based on distance
                double distance = calculateDistance(originLat, originLng, destLat, destLng);
                // Assuming average speed of 30 km/h, convert distance in km to minutes
                return Math.max(5.0, distance / 30.0 * 60.0); // Minimum 5 minutes
            }
        }

        double distance = calculateDistance(originLat, originLng, destLat, destLng);
        int weatherCode = weatherEncoding.getOrDefault(weather.toLowerCase(), 0);
        int timeOfDayCode = timeOfDayEncoding.getOrDefault(timeOfDay.toLowerCase(), 0);

        System.out.println(distance);
        double[][] singleRow = {{distance, trafficIndex, (double)weatherCode, (double)timeOfDayCode, 80.0, 50.0}};
        String[] schema = {"distance", "trafficIndex", "weatherEncoded", "timeOfDayEncoded", "batteryLevel", "speed"};
        DataFrame inputData = DataFrame.of(singleRow, schema);

//        Formula formula = Formula.lhs("y");
        double[] predictions = ((smile.regression.RandomForest) model).predict(inputData);
        return predictions[0];
    }
    
    private void saveModel() throws IOException {
        try (ObjectOutputStream oos = new ObjectOutputStream(new FileOutputStream("model.etap"))) {
            oos.writeObject(model);
            modelLoaded = true;
        }
    }


    private void loadModel() {
        File modelFile = new File("model.etap");
        if (modelFile.exists()) {
            try (ObjectInputStream ois = new ObjectInputStream(new FileInputStream(modelFile))) {
                model = (smile.regression.RandomForest) ois.readObject();
                modelLoaded = true;
            } catch (Exception e) {
                throw new RuntimeException("Model load failed: " + e.getMessage(), e);
            }
        } else {
            throw new IllegalStateException("No trained model found at model.etap");
        }
    }
    
    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        // Haversine formula
        final int R = 6371; // Radius of the earth in km
        
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        
        return R * c; // Distance in km
    }
    
    private double calculateR2(double[] actual, double[] predicted) {
        double mean = Arrays.stream(actual).average().orElse(0.0);
        double ssRes = 0.0;
        double ssTot = 0.0;
        
        for (int i = 0; i < actual.length; i++) {
            ssRes += Math.pow(actual[i] - predicted[i], 2);
            ssTot += Math.pow(actual[i] - mean, 2);
        }
        
        return 1.0 - (ssRes / ssTot);
    }
    
    private double calculateRMSE(double[] actual, double[] predicted) {
        double sum = 0.0;
        for (int i = 0; i < actual.length; i++) {
            sum += Math.pow(actual[i] - predicted[i], 2);
        }
        return Math.sqrt(sum / actual.length);
    }
    
    private double calculateMAE(double[] actual, double[] predicted) {
        double sum = 0.0;
        for (int i = 0; i < actual.length; i++) {
            sum += Math.abs(actual[i] - predicted[i]);
        }
        return sum / actual.length;
    }
}