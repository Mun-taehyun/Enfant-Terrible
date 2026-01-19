package com.enfantTerrible.enfantTerrible.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.enfantTerrible.enfantTerrible.service.user.UserService;

import jakarta.servlet.http.HttpServletResponse;
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
      // CORS 설정
      .cors(cors -> cors.configurationSource(corsConfigurationSource()))
      
      // CSRF / 세션 비활성화 (JWT 필수)
      .csrf(csrf -> csrf.disable())
      .sessionManagement(sm ->
        sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
      )

      // URL 권한 설정
      .authorizeHttpRequests(auth -> auth
        // 인증 없이 접근 (로그인/이메일 인증/비밀번호 재설정 등)
        .requestMatchers(
          "/api/auth/**",
          "/oauth2/**",
          "/login/oauth2/**",
          "/ws/**"
        ).permitAll()

        // 인증 없이 접근 (쇼핑몰 공개 조회)
        .requestMatchers(HttpMethod.GET,
          "/api/categories/**",
          "/api/products/**",
          "/api/posts/**",
          "/api/banners/**",
          "/api/popups/**"
        ).permitAll()

        // 회원가입은 인증 없이 허용
        .requestMatchers(HttpMethod.POST, "/api/users/signup").permitAll()

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
      )

      // 유효하지 않거나 만료된 토큰으로 접근시 exception
      .exceptionHandling(e -> e
        .authenticationEntryPoint((request, response, authException) -> {
          response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
          response.setContentType("application/json;charset=UTF-8");
          response.getWriter().write("""
            {
              "success": false,
              "data": null,
              "message": "유효하지 않거나 만료된 토큰입니다."
            }
            """);
        })
        .accessDeniedHandler((request, response, accessDeniedException) -> {
          response.setStatus(HttpServletResponse.SC_FORBIDDEN);
          response.setContentType("application/json;charset=UTF-8");
          response.getWriter().write("""
            {
              "success": false,
              "data": null,
              "message": "접근 권한이 없습니다."
            }
            """);
        })
      )

      // 보안 헤더 설정
      .headers(headers -> headers
        .frameOptions(frame -> frame.deny())
        .httpStrictTransportSecurity(hsts -> hsts
          .maxAgeInSeconds(31536000)
        )
      );
    return http.build();
  }

  @Bean
  public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    configuration.setAllowCredentials(true);
    configuration.addAllowedOriginPattern("*");
    configuration.addAllowedHeader("*");
    configuration.addAllowedMethod("*");
    
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);
    return source;
  }
}
