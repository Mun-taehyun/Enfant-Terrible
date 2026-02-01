package com.enfantTerrible.enfantTerrible.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

  @Value("${file.upload-dir}")
  private String uploadDir;

  @Override
  public void addResourceHandlers(ResourceHandlerRegistry registry) {
    String dir = uploadDir;
    if (!dir.endsWith("/") && !dir.endsWith("\\")) {
      dir = dir + "/";
    }

    registry
        .addResourceHandler("/uploads/**")
        .addResourceLocations("file:" + dir);
  }

  @Override
  public void addViewControllers(ViewControllerRegistry registry) {
    registry
        .addViewController("/{path:(?!api|uploads|assets)[^\\.]*}")
        .setViewName("forward:/index.html");
    registry
        .addViewController("/{path:(?!api|uploads|assets)[^\\.]*}/**")
        .setViewName("forward:/index.html");
  }
}
