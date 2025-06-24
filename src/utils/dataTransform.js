/**
 * API 응답 데이터를 트리 구조로 변환하는 유틸리티 함수들
 */

/**
 * URL에서 모델명 또는 특정 식별자 추출 (범용적)
 * AAS ID URL에서 특정 패턴의 식별자를 추출하는 함수.
 * @param {string} id - AAS ID URL
 * @returns {string|null} - 추출된 식별자 (모델명 또는 분류 코드)
 */
function extractIdentifierFromId(id) {
  if (!id) return null;
  
  // 패턴: .../aas/TungstenInsertGasType-classify/150LMT2/1/0
  const parts = id.split('/');
  
  // 'aas' 다음 다음 부분을 찾기
  const aasIndex = parts.findIndex(part => part === 'aas');
  if (aasIndex !== -1 && parts.length > aasIndex + 2) {
    const identifier = parts[aasIndex + 2];
    // 숫자만 있는 경우가 아니면 반환
    if (identifier && !identifier.match(/^\d+$/)) {
      return identifier;
    }
  }
  
  return null;
}


/**
 * 서브모델 ID 추출 함수
 */
function getSubmodelId(submodelRef) {
  if (!submodelRef) return null;

  if (submodelRef.keys && Array.isArray(submodelRef.keys)) {
    for (const key of submodelRef.keys) {
      if (key.value) {
        return key.value;
      }
    }
  }
  if (submodelRef.id) return submodelRef.id;
  if (submodelRef.value) return submodelRef.value;
  if (submodelRef.type) return submodelRef.type;

  return null;
}

/**
 * 서브모델 데이터 찾기 함수
 * (transformApiToTree에서만 사용, submodelDataList가 존재할 때 유효)
 */
function findSubmodelData(submodels, submodelId) {
  if (!submodels || !submodelId) return null;

  const submodelArray = Array.isArray(submodels) ? submodels : (submodels ? [submodels] : []);

  let found = submodelArray.find(sm => sm && sm.id === submodelId);

  if (!found) {
    found = submodelArray.find(sm => {
      if (!sm) return false;
      if (sm.idShort === submodelId) return true;
      if (getSemanticIdValue(sm.semanticId) === submodelId) return true;
      return false;
    });
  }
  return found;
}

/**
 * Semantic ID 값 추출
 */
function getSemanticIdValue(semanticId) {
  if (!semanticId?.keys?.[0]?.value) return null;
  return semanticId.keys[0].value;
}

/**
 * FacilityName 찾기
 * (transformApiToTree에서만 사용, submodelArray가 존재할 때 유효)
 */
function findFacilityName(equipment, submodelArray) {
  if (!equipment.submodel || !Array.isArray(equipment.submodel)) {
    return null;
  }

  for (const subRef of equipment.submodel) {
    const submodelId = getSubmodelId(subRef);
    const submodelData = findSubmodelData(submodelArray, submodelId);

    if (submodelData && submodelData.idShort === 'Identification') {
      if (submodelData.submodelElements) {
        const facilityNameElement = submodelData.submodelElements.find(
          element => element.idShort === 'FacilityName'
        );

        if (facilityNameElement && facilityNameElement.value) {
          return facilityNameElement.value;
        }
      }
    }
  }
  return null;
}

/**
 * Element name 포맷팅
 */
function formatElementName(element) {
  return element.idShort || 'Unnamed';
}

/**
 * Element 타입 결정
 */
function getElementType(element) {
  const typeMap = {
    'SubmodelElementCollection': 'collection',
    'Property': 'property',
    // [수정] 'MultiLanguageProperty'를 위한 별도 타입 정의
    'MultiLanguageProperty': 'multilanguageproperty',
    'File': 'file',
    'ReferenceElement': 'reference',
    'Range': 'range',
    'Blob': 'blob'
  };
  return typeMap[element.modelType] || 'element';
}

/**
 * Property 값 포맷팅
 */
function formatPropertyValue(element) {
  let value = element.value;

  if (value === null || value === undefined || value === '') {
    return null;
  }

  const unit = getUnitFromSemanticId(element.semanticId) ||
               element.unit ||
               getUnitFromIdShort(element.idShort);

  if (unit) {
    return `${value} ${unit}`;
  }
  return value;
}

/**
 * Semantic ID에서 단위 추출
 */
function getUnitFromSemanticId(semanticId) {
  if (!semanticId?.keys?.[0]?.value) return null;

  const semanticValue = semanticId.keys[0].value.toLowerCase();

  const unitPatterns = {
    'voltage': 'V', 'current': 'A', 'frequency': 'Hz', 'capacity': 'KVA',
    'power': 'KW', 'weight': 'kg', 'dimension': 'mm', 'width': 'mm',
    'height': 'mm', 'depth': 'mm', 'time': 'sec', 'temperature': '°C',
    'percentage': '%', 'dutycycle': '%'
  };

  for (const [pattern, unit] of Object.entries(unitPatterns)) {
    if (semanticValue.includes(pattern)) {
      return unit;
    }
  }
  return null;
}

/**
 * ID Short에서 단위 추출
 */
function getUnitFromIdShort(idShort) {
  if (!idShort) return null;

  const idLower = idShort.toLowerCase();

  if (idLower.includes('voltage')) return 'V';
  if (idLower.includes('current')) return 'A';
  if (idLower.includes('frequency')) return 'Hz';
  if (idLower.includes('rate') || idLower.includes('duty')) return '%';
  if (idLower.includes('weight')) return 'kg';
  if (idLower.includes('time')) return 'sec';
  if (idLower.includes('capacity')) {
    if (idLower.includes('kva')) return 'KVA';
    if (idLower.includes('kw')) return 'KW';
  }
  return null;
}

/**
 * 다국어 값 추출
 */
function getMultiLanguageValue(mlValues, preferredLang = 'en') {
  if (!Array.isArray(mlValues)) return null;

  const preferred = mlValues.find(v => v.language === preferredLang);
  if (preferred) return preferred.text;

  const english = mlValues.find(v => v.language === 'en');
  if (english) return english.text;

  return mlValues[0]?.text || null;
}

/**
 * 서브모델 요소들을 트리 구조로 변환
 */
export function transformSubmodelElements(elements, parentId = null, searchValue = null, conceptsMap = new Map()) {
  if (!Array.isArray(elements)) {
    console.warn(`[transformSubmodelElements] elements가 배열이 아닙니다. 받은 타입: ${typeof elements}`, elements);
    return [];
  }

  return elements.map((element, index) => {
    const node = {
      id: `${parentId || ''}_${element.idShort || `element_${index}`}`,
      name: formatElementName(element),
      type: getElementType(element),
      expanded: false,
      data: element,
      children: [],
      hasValue: false,
      isMatched: false
    };

    if (element.semanticId?.keys?.[0]?.value) {
      const conceptId = element.semanticId.keys[0].value;
      const concept = conceptsMap.get(conceptId);
      if (concept) {
        node.concept = concept;
      }
    }

    if (element.modelType === 'SubmodelElementCollection' && Array.isArray(element.value)) {
      node.children = transformSubmodelElements(
        element.value,
        node.id,
        searchValue,
        conceptsMap
      );
      
      // [수정 2] 검색 시 강제로 펼치는 로직 제거
      if (node.children.some(child => child.isMatched)) {
        // node.expanded = true; 
        node.isMatched = true;
      }
    } else if (element.modelType === 'SubmodelElementCollection' && element.value !== undefined) {
        node.name = `${element.idShort}: (비-배열 컬렉션)`;
    }


    if (element.modelType === 'Property') {
      if (element.value !== undefined && element.value !== null && element.value !== '') {
        node.hasValue = true;
        
        const valueDisplay = formatPropertyValue(element);
        if (valueDisplay) {
          node.name = `${element.idShort}: ${valueDisplay}`;
        }
        
        if (searchValue && String(element.value).toLowerCase().includes(String(searchValue).toLowerCase())) { 
          node.isMatched = true;
        }
      }
    }

    if (element.modelType === 'MultiLanguageProperty' && element.value) {
      const mlValue = getMultiLanguageValue(element.value);
      if (mlValue) {
        node.name = `${element.idShort}: ${mlValue}`;
        node.hasValue = true;
        if (searchValue && mlValue.toLowerCase().includes(String(searchValue).toLowerCase())) {
          node.isMatched = true;
        }
      }
    }

    if (element.modelType === 'File') {
      node.name = `${element.idShort}`;
      node.type = 'file';
      if (searchValue && (element.value?.toLowerCase().includes(String(searchValue).toLowerCase()) || element.idShort.toLowerCase().includes(String(searchValue).toLowerCase()))) {
        node.isMatched = true;
      }
    }
    return node;
  });
}

/**
 * AAS 목록과 (선택적) 서브모델 데이터를 받아 트리 구조로 변환하는 메인 함수.
 * 서브모델의 하위 요소는 searchValue가 있을 때 즉시 로드하거나, 없을 때 Lazy Loading을 위한 표시만 합니다.
 */
export function transformApiToTree(aasData, submodelDataList, searchValue = null) {
  const submodelArray = Array.isArray(submodelDataList) ? submodelDataList : (submodelDataList ? [submodelDataList] : []);

  return aasData.map((equipment, index) => {
    let equipmentName = equipment.idShort || 'Unknown AAS';
    let additionalInfo = '';

    const identifierFromId = extractIdentifierFromId(equipment.id);
    if (identifierFromId && identifierFromId !== equipment.idShort) { 
        additionalInfo = ` (${identifierFromId})`;
    } else {
        const facilityName = findFacilityName(equipment, submodelArray);
        if (facilityName && facilityName !== equipment.idShort) {
            additionalInfo = ` (${facilityName})`;
        }
    }

    equipmentName = `${equipment.idShort || 'Unknown AAS'}${additionalInfo}`;

    const equipmentNode = {
      id: equipment.id,
      name: equipmentName,
      type: 'equipment',
      expanded: false,
      data: equipment,
      children: [],
      isMatched: false 
    };

    const aasSearchText = `${equipment.idShort || ''} ${equipment.id || ''} ${equipment.assetInformation?.globalAssetId || ''}`.toLowerCase();
    if (searchValue && aasSearchText.includes(String(searchValue).toLowerCase())) {
        equipmentNode.isMatched = true;
    }

    if (equipment.submodel && Array.isArray(equipment.submodel)) {
        equipmentNode.children = equipment.submodel.map((subRef) => {
            const submodelId = getSubmodelId(subRef);
            const submodelData = findSubmodelData(submodelArray, submodelId); 

            let submodelNodeName = submodelData?.idShort;
            if (!submodelNodeName || submodelNodeName === '') {
                if (submodelId) {
                    const idParts = submodelId.match(/\/sm\/[^\/]+\/[^\/]+\/([^\/]+)\/(\d+\/\d+)?\/?$/);
                    if (idParts && idParts[1]) {
                        submodelNodeName = idParts[1];
                    } else {
                        const parts = submodelId.split('/');
                        let potentialName = parts.find(p => ['Identification', 'Nameplate', 'TechnicalData'].includes(p));
                        if(!potentialName) potentialName = parts[parts.length - 1];
                        submodelNodeName = potentialName || 'Unknown Submodel';
                    }
                } else {
                    submodelNodeName = 'Unknown Submodel';
                }
            }

            const submodelNode = {
                id: submodelId,
                name: submodelNodeName,
                type: 'submodel',
                expanded: false,
                data: submodelData || null,
                parent: equipmentNode.id,
                children: []
            };
            
            const submodelSearchText = `${submodelNode.name || ''} ${submodelNode.id || ''}`.toLowerCase();
            if (searchValue && submodelSearchText.includes(String(searchValue).toLowerCase())) {
                submodelNode.isMatched = true;
            }

            // [수정 3] 자식 노드 구성 로직 단순화
            if (searchValue && submodelData?.submodelElements) {
                // 검색 모드: 하위 요소를 즉시 변환하여 자식으로 설정
                const transformedElements = transformSubmodelElements(submodelData.submodelElements, submodelData.id, searchValue);
                submodelNode.children = transformedElements;
                if (transformedElements.some(el => el.isMatched)) {
                    submodelNode.isMatched = true;
                }
            } else {
                // [수정 3] 일반 모드: Lazy Loading을 위해 항상 placeholder 추가
                submodelNode.children = [{id: submodelId + '_placeholder', type: 'placeholder'}];
            }

            return submodelNode;
        }).filter(node => node !== null);
    }
    
    // [수정 2] 검색 시 강제로 펼치는 로직 제거
    const hasMatchedChild = equipmentNode.children.some(child => child.isMatched);
    if (equipmentNode.isMatched || hasMatchedChild) {
        // equipmentNode.expanded = true; // <- 이 줄을 제거하거나 주석 처리
        equipmentNode.isMatched = true;
    }

    return equipmentNode;
  });
}


/**
 * AAS 목록을 트리 구조로 변환하는 기존 함수 (현재는 transformApiToTree가 대신 사용됨)
 * 이 함수는 이제 사용되지 않으므로, 충돌 방지를 위해 주석 처리하거나 제거할 수 있습니다.
 */
/*
export function transformAASToTree(aasList, submodelsMap = new Map()) {
  if (!Array.isArray(aasList)) return [];

  return aasList.map(aas => {
    const aasNode = {
      id: aas.id,
      name: aas.idShort || 'Unknown AAS',
      type: 'aas',
      expanded: false,
      data: aas,
      children: [],
      level: 0
    };

    if (aas.submodel && Array.isArray(aas.submodel)) {
      aasNode.children = aas.submodel.map((subRef, index) => {
        const submodelId = getSubmodelId(subRef);
        const submodelData = submodelsMap.get(submodelId);
        
        return {
          id: submodelId || `submodel_${index}`,
          name: submodelData?.idShort || submodelId || 'Unknown Submodel',
          type: 'submodel-ref',
          expanded: false,
          data: submodelData || { id: submodelId },
          children: [],
          level: 1,
          parent: aasNode.id
        };
      });
    }

    return aasNode;
  });
}
*/

/**
 * Submodel을 트리 구조로 변환하는 함수 (현재는 transformApiToTree에서 서브모델 전체 데이터가 있을 때만 재귀적으로 호출)
 * 이 함수도 직접 사용되지 않으므로, 충돌 방지를 위해 주석 처리하거나 제거할 수 있습니다.
 */
/*
export function transformSubmodelToTree(submodel, conceptsMap = new Map()) {
  if (!submodel) return null;

  const submodelNode = {
    id: submodel.id,
    name: submodel.idShort || 'Unknown Submodel',
    type: 'submodel',
    expanded: false,
    data: submodel,
    children: []
  };

  if (submodel.submodelElements && Array.isArray(submodel.submodelElements)) {
    submodelNode.children = transformSubmodelElements(
      submodel.submodelElements,
      submodelNode.id,
      null,
      conceptsMap
    );
  }
  return submodelNode;
}
*/

// === 트리 노드 확장/축소 토글 관련 유틸리티 함수들 ===
// 이 함수들은 AAS 파일 자체에는 없었으나, 트리뷰 동작을 위해 추가되었으며,
// useSearch.js에서 import하여 사용합니다.

/**
 * 트리 노드의 expanded 상태를 토글합니다.
 * @param {Array} treeData - 전체 트리 데이터 배열
 * @param {string} nodeId - 토글할 노드의 ID
 * @returns {Array} - 업데이트된 트리 데이터 배열
 */
export function toggleNodeExpanded(treeData, nodeId) {
  return updateTreeNodes(treeData, node => {
    if (node.id === nodeId) {
      return { ...node, expanded: !node.expanded }
    }
    return node
  })
}

/**
 * 트리 노드의 selected 상태를 업데이트합니다.
 * 하나의 노드만 선택될 수 있도록 다른 노드의 selected 상태는 false로 설정합니다.
 * @param {Array} treeData - 전체 트리 데이터 배열
 * @param {string} selectedId - 선택할 노드의 ID
 * @returns {Array} - 업데이트된 트리 데이터 배열
 */
export function updateSelectedNode(treeData, selectedId) {
  return updateTreeNodes(treeData, node => ({
    ...node,
    selected: node.id === selectedId
  }))
}

/**
 * 트리 노드 업데이트 헬퍼 함수 (재귀)
 * @param {Array} nodes - 현재 레벨의 노드 배열
 * @param {Function} updateFn - 각 노드에 적용할 업데이트 함수
 * @returns {Array} - 업데이트된 노드 배열
 */
function updateTreeNodes(nodes, updateFn) {
  return nodes.map(node => {
    const updated = updateFn(node)
    if (updated.children && updated.children.length > 0) {
      updated.children = updateTreeNodes(updated.children, updateFn)
    }
    return updated
  })
}