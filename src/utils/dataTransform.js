
// --- 데이터 추출 및 검색 헬퍼 함수 --- //

/**
 * AAS ID로 사용되는 URL과 유사한 문자열에서 특정 식별자를 추출
 * 주로 모델명이나 분류 코드처럼 의미 있는 값을 찾아 반환하는 데 사용
 */
function extractIdentifierFromId(id) {
  if (!id) return null;
  
  // URL 경로처럼 '/'를 기준으로 문자열을 분할
  const parts = id.split('/');
  
  // 'aas' 세그먼트의 인덱스찾기
  const aasIndex = parts.findIndex(part => part === 'aas');

  // 'aas'와 그 뒤 두 번째 요소가 존재하면 해당 값을 식별자로 간주
  if (aasIndex !== -1 && parts.length > aasIndex + 2) {
    const identifier = parts[aasIndex + 2];
    // 식별자가 숫자만으로 구성된 경우는 제외하고 반환
    if (identifier && !identifier.match(/^\d+$/)) {
      return identifier;
    }
  }
  
  return null;
}

/**
 * Submodel 객체에서 고유 ID를 추출
 * 다양한 형식을 가질 수 있으므로, 여러 속성을 순차적으로 확인
 */
function getSubmodelId(submodelRef) {
  if (!submodelRef) return null;

  // keys 배열에서 값을 찾기
  if (submodelRef.keys && Array.isArray(submodelRef.keys)) {
    for (const key of submodelRef.keys) {
      if (key.value) {
        return key.value;
      }
    }
  }
  // 다른 가능한 속성들을 확인
  if (submodelRef.id) return submodelRef.id;
  if (submodelRef.value) return submodelRef.value;
  if (submodelRef.type) return submodelRef.type;

  return null;
}

/**
 * Submodel ID를 사용하여 전체 Submodel 데이터 목록에서 해당 데이터를 찾기
 */
function findSubmodelData(submodels, submodelId) {
  if (!submodels || !submodelId) return null;

  // 입력된 submodels가 배열이 아닐 경우를 대비해 배열만들기
  const submodelArray = Array.isArray(submodels) ? submodels : (submodels ? [submodels] : []);

  // ID가 일치하는 것을 찾기
  let found = submodelArray.find(sm => sm && sm.id === submodelId);

  // 찾지 못했다면 다른 속성(idShort, semanticId)과 비교하여 다시 찾기
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
 * semanticId 객체에서 실제 ID 값을 추출
 */
function getSemanticIdValue(semanticId) {
  if (!semanticId?.keys?.[0]?.value) return null;
  return semanticId.keys[0].value;
}

/**
 * 장비(equipment) 데이터와 Submodel 목록을 받아 'FacilityName'찾기
 * 'Identification' Submodel 안에 있는 'FacilityName' 속성 값을 반환
 */
function findFacilityName(equipment, submodelArray) {
  if (!equipment.submodel || !Array.isArray(equipment.submodel)) {
    return null;
  }

  // 장비에 연결된 모든 Submodel 참조를 순회
  for (const subRef of equipment.submodel) {
    const submodelId = getSubmodelId(subRef);
    const submodelData = findSubmodelData(submodelArray, submodelId);

    // 'Identification' Submodel을 찾기
    if (submodelData && submodelData.idShort === 'Identification') {
      if (submodelData.submodelElements) {
        // 'FacilityName' 요소를 찾아 그 값을 반환
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


// --- 데이터 포맷팅 및 타입 결정 헬퍼 함수 --- //

/**
 * Submodel Element의 이름을 포맷팅
 * idShort를 기본으로 사용
 */
function formatElementName(element) {
  return element.idShort || 'Unnamed'; // idShort가 없으면 'Unnamed' 반환
}

/**
 * Element의 modelType에 따라 간단한 타입 문자열을 결정
 */
function getElementType(element) {
  const typeMap = {
    'SubmodelElementCollection': 'collection',
    'Property': 'property',
    'MultiLanguageProperty': 'multilanguageproperty',
    'File': 'file',
    'ReferenceElement': 'reference',
    'Range': 'range',
    'Blob': 'blob'
  };
  return typeMap[element.modelType] || 'element'; // 매핑되지 않은 타입은 'element'로 처리
}

/**
 * 'Property' 타입 Element의 값을 단위(unit)와 함께 포맷팅
 */
function formatPropertyValue(element) {
  let value = element.value;

  if (value === null || value === undefined || value === '') {
    return null;
  }

  // semanticId, unit, idShort 순서로 단위를 찾기
  const unit = getUnitFromSemanticId(element.semanticId) ||
               element.unit ||
               getUnitFromIdShort(element.idShort);

  if (unit) {
    return `${value} ${unit}`;
  }
  return value;
}

/**
 * Semantic ID 값에 포함된 키워드를 기반으로 단위 추론
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
 * idShort 값에 포함된 키워드를 기반으로 단위를 추론
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
 * MultiLanguage 속성 값 배열에서 표시할 텍스트를 추출
 */
function getMultiLanguageValue(mlValues, preferredLang = 'en') {
  if (!Array.isArray(mlValues)) return null;

  // 1. 선호 언어 확인
  const preferred = mlValues.find(v => v.language === preferredLang);
  if (preferred) return preferred.text;

  // 2. 영어 확인
  const english = mlValues.find(v => v.language === 'en');
  if (english) return english.text;

  // 3. 첫 번째 값 사용
  return mlValues[0]?.text || null;
}


// --- 메인 변환 함수 --- //

/**
 * Submodel Element 목록을 재귀적으로 순회하며 트리 노드 구조로 변환
 * @param {Array} elements - 변환할 Submodel Element 배열
 * @param {string} parentId - 부모 노드의 ID (고유 ID 생성을 위해 사용)
 * @param {string} searchValue - 검색어. 일치하는 노드를 표시하는 데 사용됩니다.
 * @param {Map} conceptsMap - (미사용) 컨셉 사전을 위한 파라미터
 * @returns {Array} - 트리 노드 객체의 배열
 */
export function transformSubmodelElements(elements, parentId = null, searchValue = null, conceptsMap = new Map()) {
  if (!Array.isArray(elements)) {
    console.warn(`[transformSubmodelElements] elements가 배열이 아닙니다. 받은 타입: ${typeof elements}`, elements);
    return [];
  }

  return elements.map((element, index) => {
    // 각 element에 대한 기본 노드 구조를 생성
    const node = {
      id: `${parentId || ''}_${element.idShort || `element_${index}`}`, // 고유 ID 생성
      name: formatElementName(element), // 표시될 이름 포맷팅
      type: getElementType(element),     // 노드 타입 결정
      expanded: false,                   // 기본적으로 축소된 상태
      data: element,                     // 원본 데이터 저장
      children: [],                      // 자식 노드 배열
      hasValue: false,                   // 값을 가졌는지 여부
      isMatched: false                   // 검색어와 일치하는지 여부
    };

    // SubmodelElementCollection 타입인 경우, 자식 요소들을 재귀적으로 변환
    if (element.modelType === 'SubmodelElementCollection' && Array.isArray(element.value)) {
      node.children = transformSubmodelElements(
        element.value,
        node.id,
        searchValue,
        conceptsMap
      );
      // 자식 중에 검색어와 일치하는 것이 있으면, 부모도 일치했다고 표시
      if (node.children.some(child => child.isMatched)) {
        node.isMatched = true;
      }
    }

    // Property 타입인 경우, 값을 포맷팅하여 이름에 추가하고 검색어와 비교
    if (element.modelType === 'Property') {
      if (element.value !== undefined && element.value !== null && element.value !== '') {
        node.hasValue = true;
        const valueDisplay = formatPropertyValue(element);
        if (valueDisplay) {
          node.name = `${element.idShort}: ${valueDisplay}`;
        }
        // 검색어가 있고, 현재 속성 값에 포함된다면 'isMatched'를 true로 설정
        if (searchValue && String(element.value).toLowerCase().includes(String(searchValue).toLowerCase())) { 
          node.isMatched = true;
        }
      }
    }

    // MultiLanguageProperty 타입 처리
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

    // File 타입 처리
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
 * AAS 목록과 Submodel 데이터를 받아 전체 트리 구조로 변환하는 메인 함수
 * @param {Array} aasData - 변환할 AAS 객체 배열
 * @param {Array} submodelDataList - AAS에 포함된 Submodel의 상세 데이터 목록 
 * @param {string} searchValue - 검색어. null이 아니면 검색 모드로 동작
 * @returns {Array} - 최상위 트리 노드(장비)의 배열
 */
export function transformApiToTree(aasData, submodelDataList, searchValue = null) {
  // Submodel 데이터 목록이 항상 배열이 되도록 보정
  const submodelArray = Array.isArray(submodelDataList) ? submodelDataList : (submodelDataList ? [submodelDataList] : []);

  // 각 AAS(장비) 데이터를 순회하며 트리 노드를 생성
  return aasData.map((equipment, index) => {
    let equipmentName = equipment.idShort || 'Unknown AAS';
    let additionalInfo = ''; // 장비 이름에 추가될 부가 정보 (모델명, 설비명 등)

    // 장비 ID에서 모델명 같은 추가 정보를 추출
    const identifierFromId = extractIdentifierFromId(equipment.id);
    if (identifierFromId && identifierFromId !== equipment.idShort) { 
        additionalInfo = ` (${identifierFromId})`;
    } else {
        // ID에서 못찾으면 'Identification' 서브모델에서 FacilityName을 찾기
        const facilityName = findFacilityName(equipment, submodelArray);
        if (facilityName && facilityName !== equipment.idShort) {
            additionalInfo = ` (${facilityName})`;
        }
    }
    equipmentName = `${equipment.idShort || 'Unknown AAS'}${additionalInfo}`;

    // 장비(최상위) 노드를 생성
    const equipmentNode = {
      id: equipment.id,
      name: equipmentName,
      type: 'equipment',
      expanded: false,
      data: equipment,
      children: [],
      isMatched: false 
    };

    // 장비 정보 자체에서 검색어와 일치하는 내용이 있는지 확인
    const aasSearchText = `${equipment.idShort || ''} ${equipment.id || ''} ${equipment.assetInformation?.globalAssetId || ''}`.toLowerCase();
    if (searchValue && aasSearchText.includes(String(searchValue).toLowerCase())) {
        equipmentNode.isMatched = true;
    }

    // 장비에 연결된 Submodel들을 자식 노드로 변환
    if (equipment.submodel && Array.isArray(equipment.submodel)) {
        equipmentNode.children = equipment.submodel.map((subRef) => {
            const submodelId = getSubmodelId(subRef);
            const submodelData = findSubmodelData(submodelArray, submodelId); // 상세 데이터 목록에서 Submodel 정보를 찾음

            // Submodel의 이름을 결정(idShort 우선, 없으면 ID에서 추측).
            let submodelNodeName = submodelData?.idShort;
            if (!submodelNodeName || submodelNodeName === '') {
                if (submodelId) {
                    // ID 경로에서 의미 있는 부분을 이름으로 사용하려는 시도
                    const idParts = submodelId.match(/\/sm\/[^\/]+\/[^\/]+\/([^\/]+)\/(\d+\/\d+)?\/?$/);
                    if (idParts && idParts[1]) {
                        submodelNodeName = idParts[1];
                    } else {
                        const parts = submodelId.split('/');
                        // 더 많은 패턴 추가
                        let potentialName = parts.find(p => [
                            'Identification', 'Nameplate', 'TechnicalData',
                            'OperationData', 'Documentation', 'MachineBreakdown',
                            'AlarmData', 'operationData', 'documentation'
                        ].includes(p));
                        
                        if(!potentialName) {
                            // 숫자가 아닌 마지막 부분 찾기
                            for(let i = parts.length - 1; i >= 0; i--) {
                                if(parts[i] && !parts[i].match(/^\d+$/) && parts[i] !== '') {
                                    potentialName = parts[i];
                                    break;
                                }
                            }
                        }
                        submodelNodeName = potentialName || 'Unknown Submodel';
                        }
                } else {
                    submodelNodeName = 'Unknown Submodel';
                }
            }

            // Submodel 노드를 생성
            const submodelNode = {
                id: submodelId,
                name: submodelNodeName,
                type: 'submodel',
                expanded: false,
                data: submodelData || null, // 상세 데이터가 있으면 할당
                parent: equipmentNode.id,
                children: []
            };
            
            // Submodel 정보에서 검색어와 일치하는지 확인
            const submodelSearchText = `${submodelNode.name || ''} ${submodelNode.id || ''}`.toLowerCase();
            if (searchValue && submodelSearchText.includes(String(searchValue).toLowerCase())) {
                submodelNode.isMatched = true;
            }

            // 검색 모드일 때와 일반 모드일 때 자식 노드 구성을 다르게 처리
            if (searchValue && submodelData?.submodelElements) {
                // 검색 모드: Submodel의 하위 요소들을 즉시 변환하여 자식으로 설정
                const transformedElements = transformSubmodelElements(submodelData.submodelElements, submodelData.id, searchValue);
                submodelNode.children = transformedElements;
                if (transformedElements.some(el => el.isMatched)) {
                    submodelNode.isMatched = true; // 자식이 일치하면 부모도 일치
                }
            } else {
                // 일반 모드: 나중에 사용자가 노드를 확장할 때 데이터를 로드(Lazy Loading)하기 위해 placeholder를 추가
                submodelNode.children = [{id: submodelId + '_placeholder', type: 'placeholder'}];
            }

            return submodelNode;
        }).filter(node => node !== null);
    }
    
    // 자식 노드 중 일치하는 것이 있으면, 부모 장비 노드도 일치한다고 표시
    const hasMatchedChild = equipmentNode.children.some(child => child.isMatched);
    if (equipmentNode.isMatched || hasMatchedChild) {
        equipmentNode.isMatched = true;
    }

    return equipmentNode;
  });
}

/**
 * Submodel 검색 결과를 트리 구조로 변환
 * @param {Array} submodelList - API에서 받은 Submodel 목록
 * @param {string} searchValue - 검색어
 * @returns {Array} - 트리 노드 배열
 */
export function transformSubmodelSearch(submodelList, searchValue = null) {
  if (!Array.isArray(submodelList)) return [];

  return submodelList.map(submodel => {
    const submodelNode = {
      id: submodel.id,
      name: submodel.idShort || 'Unknown Submodel',
      type: 'submodel',
      expanded: false, // 기본적으로 접힌 상태로 변경
      data: submodel,
      children: [],
      isMatched: true // 검색 결과이므로 항상 true
    };

    if (submodel.submodelElements && Array.isArray(submodel.submodelElements)) {
      submodelNode.children = transformSubmodelElements(
        submodel.submodelElements,
        submodel.id,
        searchValue
      );
    }
    return submodelNode;
  });
}

/**
 * Concept Description 검색 결과를 트리 구조로 변환
 * @param {Array} conceptList - API에서 받은 Concept Description 목록
 * @returns {Array} - 트리 노드 배열
 */
export function transformConceptSearch(conceptList) {
  if (!Array.isArray(conceptList)) return [];

  return conceptList.map(concept => {
    let name = concept.idShort;

    const specContent = concept.embeddedDataSpecifications?.[0]?.dataSpecificationContent;
    if (specContent?.preferredName) {
      const preferredNameText = getMultiLanguageValue(specContent.preferredName, 'en');
      if (preferredNameText) {
        name = preferredNameText;
      }
    }
    
    if (!name) {
        name = 'Unknown Concept';
    }

    return {
      id: concept.id,
      name: name,
      type: 'concept',
      expanded: false,
      data: concept,
      children: [],
      isMatched: true
    };
  });
}


// === 트리 상태 업데이트 유틸리티 함수 === //
/**
 * 특정 ID를 가진 노드의 'expanded' 상태(확장/축소)를 토글
 */
export function toggleNodeExpanded(treeData, nodeId) {
  return updateTreeNodes(treeData, node => {
    if (node.id === nodeId) {
      // ID가 일치하는 노드를 찾아 expanded 값을 반전시킨 새로운 노드 객체를 반환
      return { ...node, expanded: !node.expanded }
    }
    return node // 그 외의 노드는 그대로 반환
  })
}

/**
 * 특정 ID를 가진 노드를 'selected'(선택됨) 상태로 만들고, 나머지 노드는 선택 해제
 */
export function updateSelectedNode(treeData, selectedId) {
  return updateTreeNodes(treeData, node => ({
    ...node,
    selected: node.id === selectedId // ID가 일치하는 노드만 selected를 true로 설정
  }))
}

/**
 * 트리 전체를 재귀적으로 순회하며 각 노드에 업데이트 함수를 적용하는 헬퍼 함수
 * 불변성을 유지하기 위해 모든 노드를 복사하여 새로운 트리를 반환
 */
function updateTreeNodes(nodes, updateFn) {
  return nodes.map(node => {
    // 현재 노드에 업데이트 함수를 적용
    const updated = updateFn(node)
    // 자식 노드가 있으면 재귀적으로 동일한 작업을 수행
    if (updated.children && updated.children.length > 0) {
      updated.children = updateTreeNodes(updated.children, updateFn)
    }
    return updated
  })
}