package com.enfantTerrible.enfantTerrible.service.admin.category;

import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Deque;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.enfantTerrible.enfantTerrible.dto.admin.category.AdminCategoryCreateRequest;
import com.enfantTerrible.enfantTerrible.dto.admin.category.AdminCategoryResponse;
import com.enfantTerrible.enfantTerrible.dto.admin.category.AdminCategoryRow;
import com.enfantTerrible.enfantTerrible.dto.admin.category.AdminCategoryUpdateRequest;
import com.enfantTerrible.enfantTerrible.exception.BusinessException;
import com.enfantTerrible.enfantTerrible.mapper.admin.category.AdminCategoryMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminCategoryService {

  private final AdminCategoryMapper adminCategoryMapper;

  /**
   * 관리자 - 카테고리 트리 조회 (비활성 포함, 삭제 제외)
   */
  @Transactional(readOnly = true)
  public List<AdminCategoryResponse> getCategoryTree() {

    List<AdminCategoryRow> rows = adminCategoryMapper.findAll();

    Map<Long, List<AdminCategoryResponse>> childrenMap = new HashMap<>();
    for (AdminCategoryRow row : rows) {
      AdminCategoryResponse res = toResponse(row);
      childrenMap.computeIfAbsent(row.getParentId(), k -> new ArrayList<>()).add(res);
    }

    List<AdminCategoryResponse> roots = childrenMap.getOrDefault(null, new ArrayList<>());
    for (AdminCategoryResponse root : roots) {
      attachChildren(root, childrenMap);
    }
    return roots;
  }

  /**
   * 관리자 - 카테고리 생성
   *
   * 규칙:
   * - parentId가 있으면 부모 존재해야 함 (삭제 제외)
   * - depth = (부모 depth + 1) or 0
   * - isActive 기본값 'Y'
   * - (parentId, name) 중복 금지 (삭제 제외)
   */
  public Long createCategory(AdminCategoryCreateRequest req) {

    Long parentId = req.getParentId();
    Integer depth = 0;

    if (parentId != null) {
      AdminCategoryRow parent = mustFind(parentId);
      depth = parent.getDepth() + 1;
    }

    ensureNameNotDuplicated(parentId, req.getName(), null);

    AdminCategoryRow row = new AdminCategoryRow();
    row.setParentId(parentId);
    row.setName(req.getName());
    row.setDepth(depth);
    row.setSortOrder(req.getSortOrder());
    row.setIsActive("Y");

    int affected = adminCategoryMapper.insert(row);
    if (affected != 1 || row.getCategoryId() == null) {
      throw new BusinessException("카테고리 생성에 실패했습니다.");
    }

    return row.getCategoryId();
  }

  /**
   * 관리자 - 카테고리 기본 수정 (이름/정렬/활성)
   *
   * 규칙:
   * - 대상 존재해야 함
   * - (parentId, name) 중복 금지 (자기 자신 제외)
   * - isActive는 'Y' 또는 'N'만 허용
   */
  public void updateCategory(AdminCategoryUpdateRequest req) {

    AdminCategoryRow current = mustFind(req.getCategoryId());

    String isActive = normalizeActive(req.getIsActive());

    ensureNameNotDuplicated(current.getParentId(), req.getName(), current.getCategoryId());

    AdminCategoryRow row = new AdminCategoryRow();
    row.setCategoryId(current.getCategoryId());
    row.setName(req.getName());
    row.setSortOrder(req.getSortOrder());
    row.setIsActive(isActive);

    int affected = adminCategoryMapper.update(row);
    if (affected != 1) {
      throw new BusinessException("카테고리 수정에 실패했습니다.");
    }
  }

  /**
   * 관리자 - 활성/비활성만 변경
   */
  public void updateActiveStatus(Long categoryId, String isActive) {

    mustFind(categoryId);

    String normalized = normalizeActive(isActive);

    int affected = adminCategoryMapper.updateActiveStatus(categoryId, normalized);
    if (affected != 1) {
      throw new BusinessException("카테고리 상태 변경에 실패했습니다.");
    }
  }

  /**
   * 관리자 - 정렬 순서 변경
   */
  public void updateSortOrder(Long categoryId, Integer sortOrder) {

    mustFind(categoryId);

    if (sortOrder == null || sortOrder < 0) {
      throw new BusinessException("sortOrder는 0 이상이어야 합니다.");
    }

    int affected = adminCategoryMapper.updateSortOrder(categoryId, sortOrder);
    if (affected != 1) {
      throw new BusinessException("카테고리 정렬 순서 변경에 실패했습니다.");
    }
  }

  /**
   * 관리자 - 카테고리 이동 (부모 변경)
   *
   * 규칙:
   * - 대상 존재, 새 부모 존재(또는 null)
   * - 자기 자신을 부모로 지정 금지
   * - 자신의 하위로 이동 금지 (사이클 금지)
   * - depth 재계산: (새부모 depth + 1) or 0
   * - 이동 후 서브트리 depth 전부 재계산 (중요)
   * - 새 부모 아래에서 (parentId, name) 중복 금지
   */
  public void moveCategory(Long categoryId, Long newParentId) {

    AdminCategoryRow current = mustFind(categoryId);

    // 자기 자신을 부모로 지정 금지
    if (newParentId != null && newParentId.equals(categoryId)) {
      throw new BusinessException("자기 자신을 상위 카테고리로 지정할 수 없습니다.");
    }

    AdminCategoryRow newParent = null;
    int newDepth = 0;

    if (newParentId != null) {
      newParent = mustFind(newParentId);
      newDepth = newParent.getDepth() + 1;
    }

    // 사이클 방지: newParentId가 내 서브트리에 포함되면 금지
    if (newParentId != null) {
      Set<Long> subtreeIds = loadSubtreeIds(categoryId);
      if (subtreeIds.contains(newParentId)) {
        throw new BusinessException("하위 카테고리로 이동할 수 없습니다.");
      }
    }

    // 새 부모 아래에서 이름 중복 금지
    ensureNameNotDuplicated(newParentId, current.getName(), current.getCategoryId());

    int affected = adminCategoryMapper.updateParent(categoryId, newParentId, newDepth);
    if (affected != 1) {
      throw new BusinessException("카테고리 이동에 실패했습니다.");
    }

    // 서브트리 depth 재계산 (부모가 바뀌면 자식들도 depth가 바뀜)
    recomputeSubtreeDepths(categoryId);
  }

  /**
   * 관리자 - 소프트 삭제
   *
   * 정책:
   * - deleted_at 처리
   * - 삭제된 건 관리자도 조회/복구 안 함
   */
  public void deleteCategory(Long categoryId) {

    mustFind(categoryId);

    int affected = adminCategoryMapper.softDelete(categoryId);
    if (affected != 1) {
      throw new BusinessException("카테고리 삭제에 실패했습니다.");
    }
  }

  /* =========================
   * 내부 유틸
   * ========================= */

  private AdminCategoryRow mustFind(Long categoryId) {
    Optional<AdminCategoryRow> opt = adminCategoryMapper.findById(categoryId);
    return opt.orElseThrow(() -> new BusinessException("존재하지 않는 카테고리입니다. id=" + categoryId));
  }

  private String normalizeActive(String isActive) {
    if (isActive == null) {
      throw new BusinessException("isActive 값이 필요합니다. (Y/N)");
    }
    String v = isActive.trim().toUpperCase();
    if (!v.equals("Y") && !v.equals("N")) {
      throw new BusinessException("isActive는 Y 또는 N만 허용됩니다.");
    }
    return v;
  }

  /**
   * (parentId, name) 중복 체크 (deleted_at IS NULL 범위)
   * excludeId가 있으면 자기 자신은 제외 (수정/이동 시)
   */
  private void ensureNameNotDuplicated(Long parentId, String name, Long excludeId) {

    if (name == null || name.trim().isEmpty()) {
      throw new BusinessException("카테고리 이름은 필수입니다.");
    }

    // 단순 exists는 exclude를 못하니, exclude 필요하면 서비스에서 보정:
    // - 중복이 존재하면, 실제로 같은게 자기 자신인지 확인해야 함
    // 여기서는 안전하게: "중복 가능성" 발견 시 트리에서 검증(혹은 쿼리 추가)
    // → 꼼꼼하게 하려면 Mapper에 exclude 포함한 exists를 추가하는 걸 추천.
    boolean exists = adminCategoryMapper.existsByParentAndName(parentId, name.trim());
    if (!exists) {
      return;
    }

    // excludeId가 없으면 바로 중복 처리
    if (excludeId == null) {
      throw new BusinessException("같은 상위 카테고리 아래에 동일한 이름의 카테고리가 이미 존재합니다.");
    }

    // excludeId가 있는 경우: 정확히 하려면 Mapper에 exclude 조건이 있는 exists가 필요함.
    // (현재는 꼼꼼함을 위해, findAll로 필터링해서 동일 이름/parent 찾아 비교)
    List<AdminCategoryRow> all = adminCategoryMapper.findAll();
    for (AdminCategoryRow r : all) {
      if (r.getParentId() == null) {
        if (parentId != null) continue;
      } else {
        if (parentId == null) continue;
        if (!r.getParentId().equals(parentId)) continue;
      }
      if (r.getName() != null && r.getName().equals(name.trim())) {
        if (!r.getCategoryId().equals(excludeId)) {
          throw new BusinessException("같은 상위 카테고리 아래에 동일한 이름의 카테고리가 이미 존재합니다.");
        }
      }
    }
  }

  private AdminCategoryResponse toResponse(AdminCategoryRow row) {
    AdminCategoryResponse res = new AdminCategoryResponse();
    res.setCategoryId(row.getCategoryId());
    res.setParentId(row.getParentId());
    res.setName(row.getName());
    res.setDepth(row.getDepth());
    res.setSortOrder(row.getSortOrder());
    res.setIsActive(row.getIsActive());
    res.setCreatedAt(row.getCreatedAt());
    res.setUpdatedAt(row.getUpdatedAt());
    return res;
  }

  private void attachChildren(AdminCategoryResponse parent, Map<Long, List<AdminCategoryResponse>> childrenMap) {
    List<AdminCategoryResponse> children =
        childrenMap.getOrDefault(parent.getCategoryId(), new ArrayList<>());
    parent.setChildren(children);
    for (AdminCategoryResponse child : children) {
      attachChildren(child, childrenMap);
    }
  }

  /**
   * 내 서브트리 id set 로드 (자기 자신 포함)
   */
  private Set<Long> loadSubtreeIds(Long rootId) {

    List<AdminCategoryRow> rows = adminCategoryMapper.findSubtree(rootId);

    Set<Long> ids = new HashSet<>();
    for (AdminCategoryRow r : rows) {
      ids.add(r.getCategoryId());
    }
    return ids;
  }

  /**
   * 이동 후 서브트리 depth 재계산
   *
   * 접근:
   * - findSubtree(rootId)로 삭제 제외 서브트리 전부 가져온 뒤
   * - parentId 기반으로 adjacency 구성
   * - root부터 BFS/DFS로 depth 재계산
   * - 각 노드 updateDepth로 반영
   */
  private void recomputeSubtreeDepths(Long rootId) {

    List<AdminCategoryRow> rows = adminCategoryMapper.findSubtree(rootId);

    Map<Long, AdminCategoryRow> byId = new HashMap<>();
    Map<Long, List<Long>> childIds = new HashMap<>();

    for (AdminCategoryRow r : rows) {
      byId.put(r.getCategoryId(), r);
      childIds.computeIfAbsent(r.getParentId(), k -> new ArrayList<>()).add(r.getCategoryId());
    }

    AdminCategoryRow root = byId.get(rootId);
    if (root == null) {
      // 이동 직후인데 없을 리는 없지만 방어
      throw new BusinessException("서브트리 재계산 중 카테고리를 찾을 수 없습니다.");
    }

    // root의 depth는 DB에 이미 updateParent에서 반영됐으니 그 값을 기준으로 내려간다
    int rootDepth = root.getDepth();

    Deque<Long> q = new ArrayDeque<>();
    q.add(rootId);

    Map<Long, Integer> depthMap = new HashMap<>();
    depthMap.put(rootId, rootDepth);

    while (!q.isEmpty()) {
      Long curId = q.poll();
      int curDepth = depthMap.get(curId);

      List<Long> children = childIds.getOrDefault(curId, new ArrayList<>());
      for (Long childId : children) {
        int nextDepth = curDepth + 1;
        depthMap.put(childId, nextDepth);
        q.add(childId);
      }
    }

    // root 포함 전체 depth를 DB에 반영
    for (Map.Entry<Long, Integer> e : depthMap.entrySet()) {
      Long id = e.getKey();
      Integer depth = e.getValue();
      int affected = adminCategoryMapper.updateDepth(id, depth);
      if (affected != 1) {
        throw new BusinessException("서브트리 depth 재계산에 실패했습니다.");
      }
    }
  }
}
