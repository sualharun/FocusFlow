package com.example.focusflow.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired(required = false)
    private OAuth2UserService<OAuth2UserRequest, OAuth2User> customOAuth2UserService;
    
    @Autowired
    private DemoModeConfig demoModeConfig;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        var httpSecurity = http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(authz -> {
                if (demoModeConfig.isDemoMode()) {
                    // Demo mode: Allow all requests without authentication
                    authz.anyRequest().permitAll();
                } else {
                    // Normal mode: Require authentication for most endpoints
                    authz
                        .requestMatchers("/", "/login**", "/error", "/webjars/**").permitAll()
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/h2-console/**").permitAll()
                        .requestMatchers("/ws/**").permitAll()
                        .requestMatchers("/api/**").permitAll() // Allow API access in demo mode
                        .anyRequest().authenticated();
                }
            })
            .headers(headers -> headers.frameOptions(frameOptions -> frameOptions.disable())); // For H2 console

        // Only configure OAuth if not in demo mode
        if (!demoModeConfig.isDemoMode()) {
            httpSecurity
                .oauth2Login(oauth2 -> oauth2
                    .userInfoEndpoint(userInfo -> {
                        if (customOAuth2UserService != null) {
                            userInfo.userService(customOAuth2UserService);
                        }
                    })
                    .successHandler(authenticationSuccessHandler())
                    .failureUrl("/login?error=true")
                )
                .logout(logout -> logout
                    .logoutSuccessUrl("/")
                    .invalidateHttpSession(true)
                    .clearAuthentication(true)
                );
        }
        
        return httpSecurity.build();
    }

    @Bean
    public AuthenticationSuccessHandler authenticationSuccessHandler() {
        return (request, response, authentication) -> {
            response.sendRedirect("http://localhost:3000?auth=success");
        };
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(Arrays.asList("*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
