package com.enfantTerrible.enfantTerrible.websocket;

import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import com.enfantTerrible.enfantTerrible.dto.user.UserRow;
import com.enfantTerrible.enfantTerrible.security.CustomUserDetails;
import com.enfantTerrible.enfantTerrible.security.CustomUserPrincipal;
import com.enfantTerrible.enfantTerrible.security.JwtTokenProvider;
import com.enfantTerrible.enfantTerrible.service.user.UserService;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class WebSocketJwtChannelInterceptor implements ChannelInterceptor {

  private final JwtTokenProvider jwtTokenProvider;
  private final UserService userService;

  @Override
  public Message<?> preSend(Message<?> message, MessageChannel channel) {

    StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
    if (accessor == null) {
      return message;
    }

    if (StompCommand.CONNECT.equals(accessor.getCommand())) {
      String header = accessor.getFirstNativeHeader("Authorization");
      if (header == null || !header.startsWith("Bearer ")) {
        return message;
      }

      String token = header.substring(7);

      try {
        jwtTokenProvider.validateOrThrow(token);
        if (!"ACCESS".equals(jwtTokenProvider.getTokenType(token))) {
          return message;
        }

        Long userId = jwtTokenProvider.getUserId(token);
        UserRow user = userService.getUserForSecurity(userId);

        CustomUserDetails details = new CustomUserDetails(
            user.getUserId(),
            user.getEmail(),
            user.getRole(),
            user.getStatus()
        );

        CustomUserPrincipal principal = new CustomUserPrincipal(
            user.getUserId(),
            user.getRole()
        );

        Authentication auth = new UsernamePasswordAuthenticationToken(
            principal,
            null,
            details.getAuthorities()
        );

        accessor.setUser(auth);

      } catch (Exception e) {
        return message;
      }
    }

    return message;
  }
}
