package com.sysintegg7.abatayo.wildcatslounge.product;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public List<ProductDTO> getAllProducts() {
        return productRepository.findAll().stream().map(this::toDTO).toList();
    }

    public List<ProductDTO> searchProducts(String query) {
        if (query == null || query.isBlank()) {
            return getAllProducts();
        }
        return productRepository
                .findByNameContainingIgnoreCaseOrCategoryContainingIgnoreCase(query, query)
                .stream()
                .map(this::toDTO)
                .toList();
    }

    public ProductDTO getProductById(Long id) {
        Optional<ProductEntity> product = productRepository.findById(id);
        return product.map(this::toDTO).orElse(null);
    }

    public ProductDTO createProduct(ProductDTO dto) {
        ProductEntity entity = toEntity(dto);
        entity.setId(null);
        ProductEntity saved = productRepository.save(entity);
        return toDTO(saved);
    }

    public ProductDTO updateProduct(Long id, ProductDTO dto) {
        Optional<ProductEntity> existing = productRepository.findById(id);
        if (existing.isEmpty()) {
            return null;
        }

        ProductEntity product = existing.get();
        product.setName(dto.getName());
        product.setCategory(dto.getCategory());
        product.setDescription(dto.getDescription());
        product.setPrice(dto.getPrice());
        product.setAvailable(dto.isAvailable());
        product.setImageUrl(dto.getImageUrl());

        ProductEntity saved = productRepository.save(product);
        return toDTO(saved);
    }

    private ProductDTO toDTO(ProductEntity entity) {
        return new ProductDTO(
                entity.getId(),
                entity.getName(),
                entity.getCategory(),
                entity.getDescription(),
                entity.getPrice(),
                entity.isAvailable(),
                entity.getImageUrl()
        );
    }

    private ProductEntity toEntity(ProductDTO dto) {
        return new ProductEntity(
                dto.getId(),
                dto.getName(),
                dto.getCategory(),
                dto.getDescription(),
                dto.getPrice(),
                dto.isAvailable(),
                dto.getImageUrl()
        );
    }
}
