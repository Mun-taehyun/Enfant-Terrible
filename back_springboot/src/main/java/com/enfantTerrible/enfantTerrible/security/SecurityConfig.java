package com.enfantTerrible.enfantTerrible.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.enfantTerrible.enfantTerrible.service.user.UserService;

import lombok.RequiredArgsConstructor;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

  private final JwtTokenProvider jwtTokenProvider;
  private final UserService userService;
  private final OAuth2SuccessHandler oAuth2SuccessHandler;
  private final CustomOAuth2UserService customOAuth2UserService;

  @Bean
  public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

    JwtAuthenticationFilter jwtFilter =
      new JwtAuthenticationFilter(jwtTokenProvider, userService);

    http
      // CSRF / 세션 비활성화 (JWT 필수)
      .csrf(csrf -> csrf.disable())
      .sessionManagement(sm ->
        sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
      )

      // URL 권한 설정
      .authorizeHttpRequests(auth -> auth
        // 인증 없이 접근
        .requestMatchers(
          "/api/auth/**",
          "/api/users/signup",
          "/api/users/password/reset",
          "/oauth2/**",
          "/login/oauth2/**"
        ).permitAll()

        // 관리자
        .requestMatchers("/api/admin/**").hasRole("ADMIN")

        // 그 외 API는 인증 필요
        .requestMatchers("/api/**").authenticated()

        // 나머지는 허용 (static, swagger 등)
        .anyRequest().permitAll()
      )

      // JWT 필터 등록
      .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)

      // OAith2 등록
      .oauth2Login(oauth -> oauth
        .userInfoEndpoint(u -> u.userService(customOAuth2UserService))
        .successHandler(oAuth2SuccessHandler)
      );
    return http.build();
  }

  @Bean
  public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
  }
}
