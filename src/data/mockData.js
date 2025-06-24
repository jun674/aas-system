// 첨부된 API 응답 구조를 기반으로 한 목업 데이터
export const mockApiResponse = {
  code: 200,
  status: "success",
  message: [],
  aas: [
    {
      id: "https://iacf.kyungnam.ac.kr/ids/aas/CO2Type-classify/1/0/",
      idShort: "Dynasty-350DX",
      assetInformation: {
        assetKind: "Instance",
        globalAssetId: "https://iacf.kyungnam.ac.kr/ids/sa/CO2Type-classify/1/0/"
      },
      submodel: [
        {
          keys: [
            {
              type: "Submodel",
              value: "OI73-IAO2-A4G4#OCO9"
            }
          ],
          type: "ModelReference"
        },
        {
          keys: [
            {
              type: "Submodel", 
              value: "https://iacf.kyungnam.ac.kr/ids/sa/nameplate/1/0/"
            }
          ],
          type: "ModelReference"
        },
        {
          keys: [
            {
              type: "Submodel",
              value: "OI73-IAO2-ABA171#OC5"
            }
          ],
          type: "ModelReference"
        },
        {
          keys: [
            {
              type: "Submodel",
              value: "OI73-IAO2-A4D5T9#OC9"
            }
          ],
          type: "ModelReference"
        }
      ]
    },
    {
      id: "https://iacf.kyungnam.ac.kr/ids/aas/Invertec-V350-PRO/1/0/",
      idShort: "Invertec-V350-PRO",
      assetInformation: {
        assetKind: "Instance"
      },
      submodel: [
        {
          keys: [
            {
              type: "Submodel",
              value: "OI73-IAO2-B4G4#OCO9"
            }
          ],
          type: "ModelReference"
        }
      ]
    },
    {
      id: "https://iacf.kyungnam.ac.kr/ids/aas/TIG-250P/1/0/",
      idShort: "TIG-250P",
      assetInformation: {
        assetKind: "Instance"
      },
      submodel: [
        {
          keys: [
            {
              type: "Submodel",
              value: "OI73-IAO2-C4G4#OCO9"
            }
          ],
          type: "ModelReference"
        }
      ]
    }
  ],
  submodels: [
    {
      id: "OI73-IAO2-A4G4#OCO9",
      idShort: "Identification",
      kind: "Instance",
      semanticId: {
        keys: [
          {
            type: "ConceptDescription",
            value: "OI73-IAO2-AAX2T9#OC4"
          }
        ],
        type: "ModelReference"
      },
      submodelElements: [
        {
          modelType: "Property",
          semanticId: {
            keys: [
              {
                type: "ConceptDescription",
                value: "OI73-IAO2-AAX2T9#OC4"
              }
            ],
            type: "ModelReference"
          },
          value: "Dynasty 350 DX",
          valueType: "xs:string",
          category: "CONSTANT",
          idShort: "ManufacturerName"
        }
      ]
    },
    {
      id: "OI73-IAO2-ABA171#OC5",
      idShort: "TechnicalData",
      kind: "Instance",
      semanticId: {
        keys: [
          {
            type: "ConceptDescription",
            value: "OI73-IAO2-ABA171#OC5"
          }
        ],
        type: "ModelReference"
      },
      submodelElements: [
        {
          modelType: "SubmodelElementCollection",
          semanticId: {
            keys: [
              {
                type: "ConceptDescription",
                value: "OI73-IAO2-WeldingParams#001"
              }
            ],
            type: "ModelReference"
          },
          idShort: "WeldingParameters",
          value: [
            {
              modelType: "Property",
              value: "350A",
              valueType: "xs:string",
              category: "CONSTANT",
              idShort: "MaxCurrent"
            },
            {
              modelType: "Property", 
              value: "380V",
              valueType: "xs:string",
              category: "CONSTANT",
              idShort: "InputVoltage"
            },
            {
              modelType: "Property",
              value: "Three",
              valueType: "xs:string", 
              category: "CONSTANT",
              idShort: "NumberOfPhases"
            }
          ]
        },
        {
          modelType: "SubmodelElementCollection",
          semanticId: {
            keys: [
              {
                type: "ConceptDescription",
                value: "OI73-IAO2-PhysicalProps#001"
              }
            ],
            type: "ModelReference"
          },
          idShort: "PhysicalProperties",
          value: [
            {
              modelType: "Property",
              value: "78",
              valueType: "xs:string",
              category: "CONSTANT", 
              idShort: "Weight"
            },
            {
              modelType: "Property",
              value: "수냉식",
              valueType: "xs:string",
              category: "CONSTANT",
              idShort: "CoolingType"
            }
          ]
        },
        {
          modelType: "Property",
          value: "180SLT",
          valueType: "xs:string",
          category: "CONSTANT",
          idShort: "FacilityName"
        }
      ]
    },
    {
      id: "https://iacf.kyungnam.ac.kr/ids/sa/nameplate/1/0/",
      idShort: "Nameplate",
      kind: "Instance",
      submodelElements: [
        {
          modelType: "Property",
          value: "Lincoln Electric",
          valueType: "xs:string",
          category: "CONSTANT",
          idShort: "ManufacturerName"
        }
      ]
    },
    {
      id: "OI73-IAO2-A4D5T9#OC9",
      idShort: "OperationData", 
      kind: "Instance",
      submodelElements: [
        {
          modelType: "Property",
          value: "Active",
          valueType: "xs:string",
          category: "VARIABLE",
          idShort: "Status"
        }
      ]
    },
    {
      id: "OI73-IAO2-B4G4#OCO9",
      idShort: "TechnicalData",
      kind: "Instance",
      submodelElements: [
        {
          modelType: "Property",
          value: "Invertec V350-PRO",
          valueType: "xs:string",
          category: "CONSTANT",
          idShort: "ModelName"
        }
      ]
    },
    {
      id: "OI73-IAO2-C4G4#OCO9", 
      idShort: "TechnicalData",
      kind: "Instance",
      submodelElements: [
        {
          modelType: "Property",
          value: "TIG-250P",
          valueType: "xs:string",
          category: "CONSTANT", 
          idShort: "ModelName"
        }
      ]
    }
  ]
}

// 다양한 검색 결과를 위한 추가 목업 데이터
export const mockSearchResults = {
  "380": mockApiResponse,
  "Three": mockApiResponse,
  "전류타입": {
    ...mockApiResponse,
    aas: mockApiResponse.aas.filter(item => item.idShort.includes("Dynasty"))
  },
  "입력전압": mockApiResponse
}