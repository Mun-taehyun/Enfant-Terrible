package com.enfantTerrible.enfantTerrible.security;

import java.security.Key;
import java.util.Date;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import com.enfantTerrible.enfantTerrible.common.enums.UserRole;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

@Component
public class JwtTokenProvider {

  private final Key key;
  private final long accessTokenValidityMs;
  private final long refreshTokenValidityMs;

  public JwtTokenProvider(
    @Value("${jwt.secret}") String base64Secret,
    @Value("${jwt.access-token-validity-seconds}") long accessSec,
    @Value("${jwt.refresh-token-validity-seconds}") long refreshSec
  ) {
    byte[] keyBytes = java.util.Base64.getDecoder().decode(base64Secret);
    this.key = Keys.hmacShaKeyFor(keyBytes);
    this.accessTokenValidityMs = accessSec * 1000;
    this.refreshTokenValidityMs = refreshSec * 1000;
  }

  public String createAccessToken(Long userId, UserRole role) {
    long now = System.currentTimeMillis();
    return Jwts.builder()
      .setSubject(String.valueOf(userId))
      .claim("role", role.name())       // USER / ADMIN
      .claim("typ", "ACCESS")
      .setIssuedAt(new Date(now))
      .setExpiration(new Date(now + accessTokenValidityMs))
      .signWith(key, SignatureAlgorithm.HS256)
      .compact();
  }

  public String createRefreshToken(Long userId) {
    long now = System.currentTimeMillis();
    return Jwts.builder()
      .setSubject(String.valueOf(userId))
      .claim("typ", "REFRESH")
      .setIssuedAt(new Date(now))
      .setExpiration(new Date(now + refreshTokenValidityMs))
      .signWith(key, SignatureAlgorithm.HS256)
      .compact();
  }

  /**
   * 유효성 검증
   * - true: 정상
   * - false: 위조/형식오류/서명오류 등
   * (만료를 구분해서 다루고 싶으면 validateOrThrow 사용)
   */
  public boolean validate(String token) {
    try {
      parseClaims(token);
      return true;
    } catch (JwtException | IllegalArgumentException e) {
      return false;
    }
  }

  /**
   * 만료/위조 케이스를 구분하고 싶을 때 사용
   */
  public void validateOrThrow(String token) throws ExpiredJwtException, JwtException {
    parseClaims(token);
  }

  public Long getUserId(String token) {
    return Long.valueOf(parseClaims(token).getSubject());
  }

  public String getRole(String token) {
    Object role = parseClaims(token).get("role");
    return role == null ? null : String.valueOf(role);
  }

  public String getTokenType(String token) {
    Object typ = parseClaims(token).get("typ");
    return typ == null ? null : String.valueOf(typ);
  }

  /**
   * (필터에서 많이 씀) 만료시간 얻기
   */
  public Date getExpiration(String token) {
    return parseClaims(token).getExpiration();
  }

  private Claims parseClaims(String token) {
    return Jwts.parserBuilder()
      .setSigningKey(key)
      .build()
      .parseClaimsJws(token)
      .getBody();
  }
}
