package com.neurofleetx.dto;

import lombok.Data;

@Data
public class SignupRequestDTO {
    private String email;
    private String password;
    private String firstName;
    private String lastName;
    private String role;
}