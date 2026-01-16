@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductService {

  private static final String REF_TYPE_PRODUCT = "product";
  private static final String FILE_ROLE_THUMBNAIL = "THUMBNAIL";
  private static final String FILE_ROLE_CONTENT = "CONTENT";

  private final ProductMapper productMapper;
  private final FileQueryService fileQueryService;
  private final ApplicationEventPublisher eventPublisher;
  private final AdminProductOptionGroupMapper optionGroupMapper;
  private final AdminProductOptionValueMapper optionValueMapper;

  /* =========================
     목록
     ========================= */
  public List<ProductResponse> getProducts(ProductListRequest req) {

    int page = req.getPage() == null || req.getPage() < 1 ? 1 : req.getPage();
    int size = req.getSize() == null || req.getSize() < 1 ? 20 : req.getSize();
    if (size > 100) size = 100;
    int offset = (page - 1) * size;

    List<ProductRow> rows = productMapper.findProducts(
        req.getCategoryId(),
        req.getKeyword(),
        ProductSortType.from(req.getSort()).name(),
        size,
        offset
    );

    return rows.stream().map(row -> {
      ProductResponse res = new ProductResponse();
      res.setProductId(row.getProductId());
      res.setCategoryId(row.getCategoryId());
      res.setCategoryName(row.getCategoryName());
      res.setName(row.getName());
      res.setDescription(row.getDescription());
      res.setPrice(row.getMinSkuPrice());
      res.setThumbnailUrl(
          fileQueryService.findFirstFileUrl(
              REF_TYPE_PRODUCT,
              row.getProductId(),
              FILE_ROLE_THUMBNAIL
          )
      );
      return res;
    }).toList();
  }

  /* =========================
     상세 (SKU-aware)
     ========================= */
  public ProductDetailResponse getProductDetail(Long productId, Long userId) {

    ProductRow row = productMapper.findById(productId);
    if (row == null) {
      throw new BusinessException("상품을 찾을 수 없습니다.");
    }

    ProductDetailResponse res = new ProductDetailResponse();
    res.setProductId(row.getProductId());
    res.setCategoryId(row.getCategoryId());
    res.setCategoryName(row.getCategoryName());
    res.setName(row.getName());
    res.setDescription(row.getDescription());

    res.setThumbnailUrl(
        fileQueryService.findFirstFileUrl(
            REF_TYPE_PRODUCT,
            productId,
            FILE_ROLE_THUMBNAIL
        )
    );

    res.setContentImageUrls(
        fileQueryService.findFileUrls(
            REF_TYPE_PRODUCT,
            productId,
            FILE_ROLE_CONTENT
        )
    );

    // 옵션
    res.setOptionGroups(
        optionGroupMapper.findByProductId(productId).stream().map(g -> {
          ProductOptionGroupResponse og = new ProductOptionGroupResponse();
          og.setOptionGroupId(g.getOptionGroupId());
          og.setName(g.getName());
          og.setValues(
              optionValueMapper.findByGroupId(g.getOptionGroupId()).stream()
                  .map(v -> {
                    ProductOptionValueResponse ov = new ProductOptionValueResponse();
                    ov.setOptionValueId(v.getOptionValueId());
                    ov.setValue(v.getValue());
                    return ov;
                  }).toList()
          );
          return og;
        }).toList()
    );

    // SKU
    List<ProductSkuOptionRow> skuRows =
        productMapper.findSkusWithOptions(productId);

    var skuMap = new java.util.LinkedHashMap<Long, ProductSkuResponse>();

    for (ProductSkuOptionRow r : skuRows) {
      skuMap.computeIfAbsent(r.getSkuId(), k -> {
        ProductSkuResponse s = new ProductSkuResponse();
        s.setSkuId(r.getSkuId());
        s.setPrice(r.getPrice());
        s.setStock(r.getStock());
        s.setStatus(r.getStatus());
        s.setOptionValueIds(new java.util.ArrayList<>());
        return s;
      }).getOptionValueIds().add(r.getOptionValueId());
    }

    res.setSkus(new java.util.ArrayList<>(skuMap.values()));

    eventPublisher.publishEvent(
        new ProductViewedEvent(userId, productId)
    );

    return res;
  }
}
