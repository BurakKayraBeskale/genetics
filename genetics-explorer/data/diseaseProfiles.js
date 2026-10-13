import { enrichDiseaseProfile } from './diseaseTrajectories.js';
/** Source-backed profiles. Numeric parameters are classroom abstractions, not clinical estimates. */
const RAW_DISEASE_PROFILES = [
  {
    "id": "influenza",
    "name": "Influenza",
    "category": "viral",
    "codePrefix": "FLU",
    "description": "Solunum sisteminde viral enfeksiyon",
    "initialDiagnosis": "Mekanizma hipotezi; gözlemler değerlendiriliyor",
    "growth": 1.22,
    "immuneRate": 1.1,
    "mechanism": "infectious/viral",
    "profileType": "real",
    "tissueRate": 1.4,
    "affectedSystems": [
      "respiratory",
      "systemic"
    ],
    "typicalSymptoms": [
      "Ateş",
      "Öksürük"
    ],
    "symptomProfile": {
      "respiratory": 20
    },
    "immuneResponseType": "Doğal ve edinilmiş antiviral yanıt",
    "cellularMechanism": "Solunum sisteminde viral enfeksiyon",
    "dnaRelation": {
      "kind": "response",
      "explanation": "İnsan DNA dizisi değiştirilmez; hücresel yanıt kavramsal gösterilir.",
      "sourceUrl": "https://medlineplus.gov/flu.html"
    },
    "contagious": true,
    "publicSpreadApplicable": true,
    "spreadModelNote": "Toplum görünümü soyut maruziyet eğilimini gösterir; gerçek bulaşma yolu veya epidemiyolojik tahmin değildir.",
    "educationalTimeline": [
      {
        "phase": "baseline",
        "label": "Başlangıç ve mekanizma",
        "start": 0,
        "end": 2
      },
      {
        "phase": "response",
        "label": "Belirti ve hücresel etki",
        "start": 3,
        "end": 7
      },
      {
        "phase": "observation",
        "label": "İzlem ve karşılaştırma",
        "start": 8,
        "end": 14
      }
    ],
    "timelineDisclaimer": "0–14 eğitim adımı gerçek kuluçka, hastalık süresi veya prognoz tahmini değildir. Kronik hastalıklar hızlandırılmış kavramsal adımlarla gösterilir.",
    "sources": [
      {
        "title": "MedlinePlus: Flu",
        "url": "https://medlineplus.gov/flu.html",
        "accessedAt": "2026-10-12",
        "sourceDate": "2026-10-10"
      }
    ],
    "educationalParameters": {
      "units": "abstract-0-100",
      "incubationSteps": 2,
      "severity": 55,
      "inflammation": 35,
      "tissueDamage": 30,
      "durationSteps": 14,
      "immuneEvasion": 20,
      "transmissionTendency": 40
    }
  },
  {
    "id": "chickenpox",
    "name": "Suçiçeği",
    "category": "viral",
    "mechanism": "infectious/viral",
    "profileType": "real",
    "codePrefix": "D02",
    "description": "Varisella-zoster enfeksiyonu",
    "initialDiagnosis": "Mekanizma hipotezi; gözlemler değerlendiriliyor",
    "growth": 1.2,
    "immuneRate": 1,
    "tissueRate": 1.4,
    "affectedSystems": [
      "skin"
    ],
    "typicalSymptoms": [
      "Kaşıntılı döküntü",
      "Ateş"
    ],
    "symptomProfile": {
      "skin": 15
    },
    "immuneResponseType": "Doğal ve edinilmiş antiviral yanıt",
    "cellularMechanism": "Varisella-zoster enfeksiyonu",
    "dnaRelation": {
      "kind": "response",
      "explanation": "İnsan DNA dizisi değiştirilmez; hücresel yanıt kavramsal gösterilir.",
      "sourceUrl": "https://medlineplus.gov/chickenpox.html"
    },
    "contagious": true,
    "publicSpreadApplicable": true,
    "spreadModelNote": "Toplum görünümü soyut maruziyet eğilimini gösterir; gerçek bulaşma yolu veya epidemiyolojik tahmin değildir.",
    "educationalTimeline": [
      {
        "phase": "baseline",
        "label": "Başlangıç ve mekanizma",
        "start": 0,
        "end": 2
      },
      {
        "phase": "response",
        "label": "Belirti ve hücresel etki",
        "start": 3,
        "end": 7
      },
      {
        "phase": "observation",
        "label": "İzlem ve karşılaştırma",
        "start": 8,
        "end": 14
      }
    ],
    "timelineDisclaimer": "0–14 eğitim adımı gerçek kuluçka, hastalık süresi veya prognoz tahmini değildir. Kronik hastalıklar hızlandırılmış kavramsal adımlarla gösterilir.",
    "sources": [
      {
        "title": "MedlinePlus: Chickenpox",
        "url": "https://medlineplus.gov/chickenpox.html",
        "accessedAt": "2026-10-12",
        "sourceDate": "2026-10-10"
      }
    ],
    "educationalParameters": {
      "units": "abstract-0-100",
      "incubationSteps": 2,
      "severity": 55,
      "inflammation": 35,
      "tissueDamage": 30,
      "durationSteps": 14,
      "immuneEvasion": 20,
      "transmissionTendency": 40
    }
  },
  {
    "id": "measles",
    "name": "Kızamık",
    "category": "viral",
    "mechanism": "infectious/viral",
    "profileType": "real",
    "codePrefix": "D03",
    "description": "Viral enfeksiyon ve deri döküntüsü",
    "initialDiagnosis": "Mekanizma hipotezi; gözlemler değerlendiriliyor",
    "growth": 1.2,
    "immuneRate": 1,
    "tissueRate": 1.4,
    "affectedSystems": [
      "respiratory",
      "skin"
    ],
    "typicalSymptoms": [
      "Döküntü",
      "Ateş"
    ],
    "symptomProfile": {
      "respiratory": 15,
      "skin": 15
    },
    "immuneResponseType": "Doğal ve edinilmiş antiviral yanıt",
    "cellularMechanism": "Viral enfeksiyon ve deri döküntüsü",
    "dnaRelation": {
      "kind": "response",
      "explanation": "İnsan DNA dizisi değiştirilmez; hücresel yanıt kavramsal gösterilir.",
      "sourceUrl": "https://medlineplus.gov/measles.html"
    },
    "contagious": true,
    "publicSpreadApplicable": true,
    "spreadModelNote": "Toplum görünümü soyut maruziyet eğilimini gösterir; gerçek bulaşma yolu veya epidemiyolojik tahmin değildir.",
    "educationalTimeline": [
      {
        "phase": "baseline",
        "label": "Başlangıç ve mekanizma",
        "start": 0,
        "end": 2
      },
      {
        "phase": "response",
        "label": "Belirti ve hücresel etki",
        "start": 3,
        "end": 7
      },
      {
        "phase": "observation",
        "label": "İzlem ve karşılaştırma",
        "start": 8,
        "end": 14
      }
    ],
    "timelineDisclaimer": "0–14 eğitim adımı gerçek kuluçka, hastalık süresi veya prognoz tahmini değildir. Kronik hastalıklar hızlandırılmış kavramsal adımlarla gösterilir.",
    "sources": [
      {
        "title": "MedlinePlus: Measles",
        "url": "https://medlineplus.gov/measles.html",
        "accessedAt": "2026-10-12",
        "sourceDate": "2026-10-10"
      }
    ],
    "educationalParameters": {
      "units": "abstract-0-100",
      "incubationSteps": 2,
      "severity": 55,
      "inflammation": 35,
      "tissueDamage": 30,
      "durationSteps": 14,
      "immuneEvasion": 20,
      "transmissionTendency": 40
    }
  },
  {
    "id": "mumps",
    "name": "Kabakulak",
    "category": "viral",
    "mechanism": "infectious/viral",
    "profileType": "real",
    "codePrefix": "D04",
    "description": "Viral enfeksiyona bağlı tükürük bezi tutulumu",
    "initialDiagnosis": "Mekanizma hipotezi; gözlemler değerlendiriliyor",
    "growth": 1.2,
    "immuneRate": 1,
    "tissueRate": 1.4,
    "affectedSystems": [
      "systemic"
    ],
    "typicalSymptoms": [
      "Tükürük bezi şişliği",
      "Ateş"
    ],
    "symptomProfile": {
      "systemic": 15
    },
    "immuneResponseType": "Doğal ve edinilmiş antiviral yanıt",
    "cellularMechanism": "Viral enfeksiyona bağlı tükürük bezi tutulumu",
    "dnaRelation": {
      "kind": "response",
      "explanation": "İnsan DNA dizisi değiştirilmez; hücresel yanıt kavramsal gösterilir.",
      "sourceUrl": "https://medlineplus.gov/mumps.html"
    },
    "contagious": true,
    "publicSpreadApplicable": true,
    "spreadModelNote": "Toplum görünümü soyut maruziyet eğilimini gösterir; gerçek bulaşma yolu veya epidemiyolojik tahmin değildir.",
    "educationalTimeline": [
      {
        "phase": "baseline",
        "label": "Başlangıç ve mekanizma",
        "start": 0,
        "end": 2
      },
      {
        "phase": "response",
        "label": "Belirti ve hücresel etki",
        "start": 3,
        "end": 7
      },
      {
        "phase": "observation",
        "label": "İzlem ve karşılaştırma",
        "start": 8,
        "end": 14
      }
    ],
    "timelineDisclaimer": "0–14 eğitim adımı gerçek kuluçka, hastalık süresi veya prognoz tahmini değildir. Kronik hastalıklar hızlandırılmış kavramsal adımlarla gösterilir.",
    "sources": [
      {
        "title": "MedlinePlus: Mumps",
        "url": "https://medlineplus.gov/mumps.html",
        "accessedAt": "2026-10-12",
        "sourceDate": "2026-10-10"
      }
    ],
    "educationalParameters": {
      "units": "abstract-0-100",
      "incubationSteps": 2,
      "severity": 55,
      "inflammation": 35,
      "tissueDamage": 30,
      "durationSteps": 14,
      "immuneEvasion": 20,
      "transmissionTendency": 40
    }
  },
  {
    "id": "rubella",
    "name": "Kızamıkçık",
    "category": "viral",
    "mechanism": "infectious/viral",
    "profileType": "real",
    "codePrefix": "D05",
    "description": "Hafif veya belirtisiz olabilen viral enfeksiyon",
    "initialDiagnosis": "Mekanizma hipotezi; gözlemler değerlendiriliyor",
    "growth": 1.2,
    "immuneRate": 1,
    "tissueRate": 1.4,
    "affectedSystems": [
      "skin"
    ],
    "typicalSymptoms": [
      "Döküntü",
      "Ateş"
    ],
    "symptomProfile": {
      "skin": 15
    },
    "immuneResponseType": "Doğal ve edinilmiş antiviral yanıt",
    "cellularMechanism": "Hafif veya belirtisiz olabilen viral enfeksiyon",
    "dnaRelation": {
      "kind": "response",
      "explanation": "İnsan DNA dizisi değiştirilmez; hücresel yanıt kavramsal gösterilir.",
      "sourceUrl": "https://medlineplus.gov/rubella.html"
    },
    "contagious": true,
    "publicSpreadApplicable": true,
    "spreadModelNote": "Toplum görünümü soyut maruziyet eğilimini gösterir; gerçek bulaşma yolu veya epidemiyolojik tahmin değildir.",
    "educationalTimeline": [
      {
        "phase": "baseline",
        "label": "Başlangıç ve mekanizma",
        "start": 0,
        "end": 2
      },
      {
        "phase": "response",
        "label": "Belirti ve hücresel etki",
        "start": 3,
        "end": 7
      },
      {
        "phase": "observation",
        "label": "İzlem ve karşılaştırma",
        "start": 8,
        "end": 14
      }
    ],
    "timelineDisclaimer": "0–14 eğitim adımı gerçek kuluçka, hastalık süresi veya prognoz tahmini değildir. Kronik hastalıklar hızlandırılmış kavramsal adımlarla gösterilir.",
    "sources": [
      {
        "title": "MedlinePlus: Rubella",
        "url": "https://medlineplus.gov/rubella.html",
        "accessedAt": "2026-10-12",
        "sourceDate": "2026-10-10"
      }
    ],
    "educationalParameters": {
      "units": "abstract-0-100",
      "incubationSteps": 2,
      "severity": 55,
      "inflammation": 35,
      "tissueDamage": 30,
      "durationSteps": 14,
      "immuneEvasion": 20,
      "transmissionTendency": 40
    }
  },
  {
    "id": "hepatitis-a",
    "name": "Hepatit A",
    "category": "viral",
    "mechanism": "infectious/viral",
    "profileType": "real",
    "codePrefix": "D06",
    "description": "Akut viral karaciğer inflamasyonu",
    "initialDiagnosis": "Mekanizma hipotezi; gözlemler değerlendiriliyor",
    "growth": 1.2,
    "immuneRate": 1,
    "tissueRate": 1.4,
    "affectedSystems": [
      "digestive"
    ],
    "typicalSymptoms": [
      "Yorgunluk",
      "Sarılık"
    ],
    "symptomProfile": {
      "digestive": 15
    },
    "immuneResponseType": "Doğal ve edinilmiş antiviral yanıt",
    "cellularMechanism": "Akut viral karaciğer inflamasyonu",
    "dnaRelation": {
      "kind": "response",
      "explanation": "İnsan DNA dizisi değiştirilmez; hücresel yanıt kavramsal gösterilir.",
      "sourceUrl": "https://medlineplus.gov/hepatitisa.html"
    },
    "contagious": true,
    "publicSpreadApplicable": true,
    "spreadModelNote": "Toplum görünümü soyut maruziyet eğilimini gösterir; gerçek bulaşma yolu veya epidemiyolojik tahmin değildir.",
    "educationalTimeline": [
      {
        "phase": "baseline",
        "label": "Başlangıç ve mekanizma",
        "start": 0,
        "end": 2
      },
      {
        "phase": "response",
        "label": "Belirti ve hücresel etki",
        "start": 3,
        "end": 7
      },
      {
        "phase": "observation",
        "label": "İzlem ve karşılaştırma",
        "start": 8,
        "end": 14
      }
    ],
    "timelineDisclaimer": "0–14 eğitim adımı gerçek kuluçka, hastalık süresi veya prognoz tahmini değildir. Kronik hastalıklar hızlandırılmış kavramsal adımlarla gösterilir.",
    "sources": [
      {
        "title": "MedlinePlus: Hepatitis A",
        "url": "https://medlineplus.gov/hepatitisa.html",
        "accessedAt": "2026-10-12",
        "sourceDate": "2026-10-10"
      }
    ],
    "educationalParameters": {
      "units": "abstract-0-100",
      "incubationSteps": 2,
      "severity": 55,
      "inflammation": 35,
      "tissueDamage": 30,
      "durationSteps": 14,
      "immuneEvasion": 20,
      "transmissionTendency": 40
    }
  },
  {
    "id": "hepatitis-b",
    "name": "Hepatit B",
    "category": "viral",
    "mechanism": "infectious/viral",
    "profileType": "real",
    "codePrefix": "D07",
    "description": "Akut veya kronik viral karaciğer enfeksiyonu",
    "initialDiagnosis": "Mekanizma hipotezi; gözlemler değerlendiriliyor",
    "growth": 1.2,
    "immuneRate": 1,
    "tissueRate": 1.4,
    "affectedSystems": [
      "digestive"
    ],
    "typicalSymptoms": [
      "Yorgunluk",
      "Sarılık"
    ],
    "symptomProfile": {
      "digestive": 15
    },
    "immuneResponseType": "Doğal ve edinilmiş antiviral yanıt",
    "cellularMechanism": "Akut veya kronik viral karaciğer enfeksiyonu",
    "dnaRelation": {
      "kind": "response",
      "explanation": "İnsan DNA dizisi değiştirilmez; hücresel yanıt kavramsal gösterilir.",
      "sourceUrl": "https://medlineplus.gov/hepatitisb.html"
    },
    "contagious": true,
    "publicSpreadApplicable": true,
    "spreadModelNote": "Toplum görünümü soyut maruziyet eğilimini gösterir; gerçek bulaşma yolu veya epidemiyolojik tahmin değildir.",
    "educationalTimeline": [
      {
        "phase": "baseline",
        "label": "Başlangıç ve mekanizma",
        "start": 0,
        "end": 2
      },
      {
        "phase": "response",
        "label": "Belirti ve hücresel etki",
        "start": 3,
        "end": 7
      },
      {
        "phase": "observation",
        "label": "İzlem ve karşılaştırma",
        "start": 8,
        "end": 14
      }
    ],
    "timelineDisclaimer": "0–14 eğitim adımı gerçek kuluçka, hastalık süresi veya prognoz tahmini değildir. Kronik hastalıklar hızlandırılmış kavramsal adımlarla gösterilir.",
    "sources": [
      {
        "title": "MedlinePlus: Hepatitis B",
        "url": "https://medlineplus.gov/hepatitisb.html",
        "accessedAt": "2026-10-12",
        "sourceDate": "2026-10-10"
      }
    ],
    "educationalParameters": {
      "units": "abstract-0-100",
      "incubationSteps": 2,
      "severity": 55,
      "inflammation": 35,
      "tissueDamage": 30,
      "durationSteps": 14,
      "immuneEvasion": 20,
      "transmissionTendency": 40
    }
  },
  {
    "id": "hepatitis-c",
    "name": "Hepatit C",
    "category": "viral",
    "mechanism": "infectious/viral",
    "profileType": "real",
    "codePrefix": "D08",
    "description": "Kronikleşebilen viral karaciğer inflamasyonu",
    "initialDiagnosis": "Mekanizma hipotezi; gözlemler değerlendiriliyor",
    "growth": 1.2,
    "immuneRate": 1,
    "tissueRate": 1.4,
    "affectedSystems": [
      "digestive"
    ],
    "typicalSymptoms": [
      "Yorgunluk",
      "Sarılık"
    ],
    "symptomProfile": {
      "digestive": 15
    },
    "immuneResponseType": "Doğal ve edinilmiş antiviral yanıt",
    "cellularMechanism": "Kronikleşebilen viral karaciğer inflamasyonu",
    "dnaRelation": {
      "kind": "response",
      "explanation": "İnsan DNA dizisi değiştirilmez; hücresel yanıt kavramsal gösterilir.",
      "sourceUrl": "https://medlineplus.gov/hepatitisc.html"
    },
    "contagious": true,
    "publicSpreadApplicable": true,
    "spreadModelNote": "Toplum görünümü soyut maruziyet eğilimini gösterir; gerçek bulaşma yolu veya epidemiyolojik tahmin değildir.",
    "educationalTimeline": [
      {
        "phase": "baseline",
        "label": "Başlangıç ve mekanizma",
        "start": 0,
        "end": 2
      },
      {
        "phase": "response",
        "label": "Belirti ve hücresel etki",
        "start": 3,
        "end": 7
      },
      {
        "phase": "observation",
        "label": "İzlem ve karşılaştırma",
        "start": 8,
        "end": 14
      }
    ],
    "timelineDisclaimer": "0–14 eğitim adımı gerçek kuluçka, hastalık süresi veya prognoz tahmini değildir. Kronik hastalıklar hızlandırılmış kavramsal adımlarla gösterilir.",
    "sources": [
      {
        "title": "MedlinePlus: Hepatitis C",
        "url": "https://medlineplus.gov/hepatitisc.html",
        "accessedAt": "2026-10-12",
        "sourceDate": "2026-10-10"
      }
    ],
    "educationalParameters": {
      "units": "abstract-0-100",
      "incubationSteps": 2,
      "severity": 55,
      "inflammation": 35,
      "tissueDamage": 30,
      "durationSteps": 14,
      "immuneEvasion": 20,
      "transmissionTendency": 40
    }
  },
  {
    "id": "hiv",
    "name": "HIV enfeksiyonu",
    "category": "viral",
    "mechanism": "infectious/viral",
    "profileType": "real",
    "codePrefix": "D09",
    "description": "Bağışıklık hücrelerine zarar veren viral enfeksiyon",
    "initialDiagnosis": "Mekanizma hipotezi; gözlemler değerlendiriliyor",
    "growth": 1.2,
    "immuneRate": 1,
    "tissueRate": 1.4,
    "affectedSystems": [
      "systemic"
    ],
    "typicalSymptoms": [
      "Ateş",
      "Yorgunluk"
    ],
    "symptomProfile": {
      "systemic": 15
    },
    "immuneResponseType": "Doğal ve edinilmiş antiviral yanıt",
    "cellularMechanism": "Bağışıklık hücrelerine zarar veren viral enfeksiyon",
    "dnaRelation": {
      "kind": "response",
      "explanation": "İnsan DNA dizisi değiştirilmez; hücresel yanıt kavramsal gösterilir.",
      "sourceUrl": "https://medlineplus.gov/hiv.html"
    },
    "contagious": true,
    "publicSpreadApplicable": true,
    "spreadModelNote": "Toplum görünümü soyut maruziyet eğilimini gösterir; gerçek bulaşma yolu veya epidemiyolojik tahmin değildir.",
    "educationalTimeline": [
      {
        "phase": "baseline",
        "label": "Başlangıç ve mekanizma",
        "start": 0,
        "end": 2
      },
      {
        "phase": "response",
        "label": "Belirti ve hücresel etki",
        "start": 3,
        "end": 7
      },
      {
        "phase": "observation",
        "label": "İzlem ve karşılaştırma",
        "start": 8,
        "end": 14
      }
    ],
    "timelineDisclaimer": "0–14 eğitim adımı gerçek kuluçka, hastalık süresi veya prognoz tahmini değildir. Kronik hastalıklar hızlandırılmış kavramsal adımlarla gösterilir.",
    "sources": [
      {
        "title": "MedlinePlus: HIV",
        "url": "https://medlineplus.gov/hiv.html",
        "accessedAt": "2026-10-12",
        "sourceDate": "2026-10-10"
      }
    ],
    "educationalParameters": {
      "units": "abstract-0-100",
      "incubationSteps": 2,
      "severity": 55,
      "inflammation": 35,
      "tissueDamage": 30,
      "durationSteps": 14,
      "immuneEvasion": 20,
      "transmissionTendency": 40
    }
  },
  {
    "id": "norovirus",
    "name": "Norovirüs enfeksiyonu",
    "category": "viral",
    "mechanism": "infectious/viral",
    "profileType": "real",
    "codePrefix": "D10",
    "description": "Viral gastroenterit",
    "initialDiagnosis": "Mekanizma hipotezi; gözlemler değerlendiriliyor",
    "growth": 1.2,
    "immuneRate": 1,
    "tissueRate": 1.4,
    "affectedSystems": [
      "digestive"
    ],
    "typicalSymptoms": [
      "İshal",
      "Kusma"
    ],
    "symptomProfile": {
      "digestive": 15
    },
    "immuneResponseType": "Doğal ve edinilmiş antiviral yanıt",
    "cellularMechanism": "Viral gastroenterit",
    "dnaRelation": {
      "kind": "response",
      "explanation": "İnsan DNA dizisi değiştirilmez; hücresel yanıt kavramsal gösterilir.",
      "sourceUrl": "https://medlineplus.gov/norovirusinfections.html"
    },
    "contagious": true,
    "publicSpreadApplicable": true,
    "spreadModelNote": "Toplum görünümü soyut maruziyet eğilimini gösterir; gerçek bulaşma yolu veya epidemiyolojik tahmin değildir.",
    "educationalTimeline": [
      {
        "phase": "baseline",
        "label": "Başlangıç ve mekanizma",
        "start": 0,
        "end": 2
      },
      {
        "phase": "response",
        "label": "Belirti ve hücresel etki",
        "start": 3,
        "end": 7
      },
      {
        "phase": "observation",
        "label": "İzlem ve karşılaştırma",
        "start": 8,
        "end": 14
      }
    ],
    "timelineDisclaimer": "0–14 eğitim adımı gerçek kuluçka, hastalık süresi veya prognoz tahmini değildir. Kronik hastalıklar hızlandırılmış kavramsal adımlarla gösterilir.",
    "sources": [
      {
        "title": "MedlinePlus: Norovirus Infections",
        "url": "https://medlineplus.gov/norovirusinfections.html",
        "accessedAt": "2026-10-12",
        "sourceDate": "2026-10-10"
      }
    ],
    "educationalParameters": {
      "units": "abstract-0-100",
      "incubationSteps": 2,
      "severity": 55,
      "inflammation": 35,
      "tissueDamage": 30,
      "durationSteps": 14,
      "immuneEvasion": 20,
      "transmissionTendency": 40
    }
  },
  {
    "id": "rabies",
    "name": "Kuduz",
    "category": "viral",
    "mechanism": "infectious/viral",
    "profileType": "real",
    "codePrefix": "D11",
    "description": "Hayvan kaynaklı viral sinir sistemi hastalığı",
    "initialDiagnosis": "Mekanizma hipotezi; gözlemler değerlendiriliyor",
    "growth": 1.2,
    "immuneRate": 1,
    "tissueRate": 1.4,
    "affectedSystems": [
      "neurological"
    ],
    "typicalSymptoms": [
      "Konfüzyon",
      "Felç"
    ],
    "symptomProfile": {
      "neurological": 15
    },
    "immuneResponseType": "Doğal ve edinilmiş antiviral yanıt",
    "cellularMechanism": "Hayvan kaynaklı viral sinir sistemi hastalığı",
    "dnaRelation": {
      "kind": "response",
      "explanation": "İnsan DNA dizisi değiştirilmez; hücresel yanıt kavramsal gösterilir.",
      "sourceUrl": "https://medlineplus.gov/rabies.html"
    },
    "contagious": false,
    "publicSpreadApplicable": false,
    "spreadModelNote": "Toplum görünümü soyut maruziyet eğilimini gösterir; gerçek bulaşma yolu veya epidemiyolojik tahmin değildir.",
    "educationalTimeline": [
      {
        "phase": "baseline",
        "label": "Başlangıç ve mekanizma",
        "start": 0,
        "end": 2
      },
      {
        "phase": "response",
        "label": "Belirti ve hücresel etki",
        "start": 3,
        "end": 7
      },
      {
        "phase": "observation",
        "label": "İzlem ve karşılaştırma",
        "start": 8,
        "end": 14
      }
    ],
    "timelineDisclaimer": "0–14 eğitim adımı gerçek kuluçka, hastalık süresi veya prognoz tahmini değildir. Kronik hastalıklar hızlandırılmış kavramsal adımlarla gösterilir.",
    "sources": [
      {
        "title": "MedlinePlus: Rabies",
        "url": "https://medlineplus.gov/rabies.html",
        "accessedAt": "2026-10-12",
        "sourceDate": "2026-10-10"
      }
    ],
    "educationalParameters": {
      "units": "abstract-0-100",
      "incubationSteps": 2,
      "severity": 55,
      "inflammation": 35,
      "tissueDamage": 30,
      "durationSteps": 14,
      "immuneEvasion": 20,
      "transmissionTendency": 0
    }
  },
  {
    "id": "shingles",
    "name": "Zona",
    "category": "viral",
    "mechanism": "infectious/viral",
    "profileType": "real",
    "codePrefix": "D12",
    "description": "Varisella-zoster virüsünün yeniden etkinleşmesi",
    "initialDiagnosis": "Mekanizma hipotezi; gözlemler değerlendiriliyor",
    "growth": 1.2,
    "immuneRate": 1,
    "tissueRate": 1.4,
    "affectedSystems": [
      "skin",
      "neurological"
    ],
    "typicalSymptoms": [
      "Ağrılı döküntü"
    ],
    "symptomProfile": {
      "skin": 15,
      "neurological": 15
    },
    "immuneResponseType": "Doğal ve edinilmiş antiviral yanıt",
    "cellularMechanism": "Varisella-zoster virüsünün yeniden etkinleşmesi",
    "dnaRelation": {
      "kind": "response",
      "explanation": "İnsan DNA dizisi değiştirilmez; hücresel yanıt kavramsal gösterilir.",
      "sourceUrl": "https://medlineplus.gov/shingles.html"
    },
    "contagious": false,
    "publicSpreadApplicable": false,
    "spreadModelNote": "Toplum görünümü soyut maruziyet eğilimini gösterir; gerçek bulaşma yolu veya epidemiyolojik tahmin değildir.",
    "educationalTimeline": [
      {
        "phase": "baseline",
        "label": "Başlangıç ve mekanizma",
        "start": 0,
        "end": 2
      },
      {
        "phase": "response",
        "label": "Belirti ve hücresel etki",
        "start": 3,
        "end": 7
      },
      {
        "phase": "observation",
        "label": "İzlem ve karşılaştırma",
        "start": 8,
        "end": 14
      }
    ],
    "timelineDisclaimer": "0–14 eğitim adımı gerçek kuluçka, hastalık süresi veya prognoz tahmini değildir. Kronik hastalıklar hızlandırılmış kavramsal adımlarla gösterilir.",
    "sources": [
      {
        "title": "MedlinePlus: Shingles",
        "url": "https://medlineplus.gov/shingles.html",
        "accessedAt": "2026-10-12",
        "sourceDate": "2026-10-10"
      }
    ],
    "educationalParameters": {
      "units": "abstract-0-100",
      "incubationSteps": 2,
      "severity": 55,
      "inflammation": 35,
      "tissueDamage": 30,
      "durationSteps": 14,
      "immuneEvasion": 20,
      "transmissionTendency": 0
    }
  },
  {
    "id": "tuberculosis",
    "name": "Tüberküloz",
    "category": "bacterial",
    "mechanism": "infectious/bacterial",
    "profileType": "real",
    "codePrefix": "D13",
    "description": "Çoğunlukla akciğerleri tutan bakteriyel hastalık",
    "initialDiagnosis": "Mekanizma hipotezi; gözlemler değerlendiriliyor",
    "growth": 1.2,
    "immuneRate": 1,
    "tissueRate": 1.4,
    "affectedSystems": [
      "respiratory"
    ],
    "typicalSymptoms": [
      "Öksürük",
      "Gece terlemesi"
    ],
    "symptomProfile": {
      "respiratory": 15
    },
    "immuneResponseType": "Doğal ve edinilmiş antibakteriyel yanıt",
    "cellularMechanism": "Çoğunlukla akciğerleri tutan bakteriyel hastalık",
    "dnaRelation": {
      "kind": "response",
      "explanation": "İnsan DNA dizisi değiştirilmez; hücresel yanıt kavramsal gösterilir.",
      "sourceUrl": "https://medlineplus.gov/tuberculosis.html"
    },
    "contagious": true,
    "publicSpreadApplicable": true,
    "spreadModelNote": "Toplum görünümü soyut maruziyet eğilimini gösterir; gerçek bulaşma yolu veya epidemiyolojik tahmin değildir.",
    "educationalTimeline": [
      {
        "phase": "baseline",
        "label": "Başlangıç ve mekanizma",
        "start": 0,
        "end": 2
      },
      {
        "phase": "response",
        "label": "Belirti ve hücresel etki",
        "start": 3,
        "end": 7
      },
      {
        "phase": "observation",
        "label": "İzlem ve karşılaştırma",
        "start": 8,
        "end": 14
      }
    ],
    "timelineDisclaimer": "0–14 eğitim adımı gerçek kuluçka, hastalık süresi veya prognoz tahmini değildir. Kronik hastalıklar hızlandırılmış kavramsal adımlarla gösterilir.",
    "sources": [
      {
        "title": "MedlinePlus: Tuberculosis",
        "url": "https://medlineplus.gov/tuberculosis.html",
        "accessedAt": "2026-10-12",
        "sourceDate": "2026-10-10"
      }
    ],
    "educationalParameters": {
      "units": "abstract-0-100",
      "incubationSteps": 2,
      "severity": 55,
      "inflammation": 35,
      "tissueDamage": 30,
      "durationSteps": 14,
      "immuneEvasion": 20,
      "transmissionTendency": 40
    }
  },
  {
    "id": "cholera",
    "name": "Kolera",
    "category": "bacterial",
    "mechanism": "infectious/bacterial",
    "profileType": "real",
    "codePrefix": "D14",
    "description": "Kontamine gıda veya su kaynaklı bakteriyel enfeksiyon",
    "initialDiagnosis": "Mekanizma hipotezi; gözlemler değerlendiriliyor",
    "growth": 1.2,
    "immuneRate": 1,
    "tissueRate": 1.4,
    "affectedSystems": [
      "digestive"
    ],
    "typicalSymptoms": [
      "Sulu ishal",
      "Dehidrasyon"
    ],
    "symptomProfile": {
      "digestive": 15
    },
    "immuneResponseType": "Doğal ve edinilmiş antibakteriyel yanıt",
    "cellularMechanism": "Kontamine gıda veya su kaynaklı bakteriyel enfeksiyon",
    "dnaRelation": {
      "kind": "response",
      "explanation": "İnsan DNA dizisi değiştirilmez; hücresel yanıt kavramsal gösterilir.",
      "sourceUrl": "https://medlineplus.gov/cholera.html"
    },
    "contagious": true,
    "publicSpreadApplicable": true,
    "spreadModelNote": "Toplum görünümü soyut maruziyet eğilimini gösterir; gerçek bulaşma yolu veya epidemiyolojik tahmin değildir.",
    "educationalTimeline": [
      {
        "phase": "baseline",
        "label": "Başlangıç ve mekanizma",
        "start": 0,
        "end": 2
      },
      {
        "phase": "response",
        "label": "Belirti ve hücresel etki",
        "start": 3,
        "end": 7
      },
      {
        "phase": "observation",
        "label": "İzlem ve karşılaştırma",
        "start": 8,
        "end": 14
      }
    ],
    "timelineDisclaimer": "0–14 eğitim adımı gerçek kuluçka, hastalık süresi veya prognoz tahmini değildir. Kronik hastalıklar hızlandırılmış kavramsal adımlarla gösterilir.",
    "sources": [
      {
        "title": "MedlinePlus: Cholera",
        "url": "https://medlineplus.gov/cholera.html",
        "accessedAt": "2026-10-12",
        "sourceDate": "2026-10-10"
      }
    ],
    "educationalParameters": {
      "units": "abstract-0-100",
      "incubationSteps": 2,
      "severity": 55,
      "inflammation": 35,
      "tissueDamage": 30,
      "durationSteps": 14,
      "immuneEvasion": 20,
      "transmissionTendency": 40
    }
  },
  {
    "id": "pertussis",
    "name": "Boğmaca",
    "category": "bacterial",
    "mechanism": "infectious/bacterial",
    "profileType": "real",
    "codePrefix": "D15",
    "description": "Bordetella pertussis kaynaklı solunum enfeksiyonu",
    "initialDiagnosis": "Mekanizma hipotezi; gözlemler değerlendiriliyor",
    "growth": 1.2,
    "immuneRate": 1,
    "tissueRate": 1.4,
    "affectedSystems": [
      "respiratory"
    ],
    "typicalSymptoms": [
      "Öksürük nöbetleri"
    ],
    "symptomProfile": {
      "respiratory": 15
    },
    "immuneResponseType": "Doğal ve edinilmiş antibakteriyel yanıt",
    "cellularMechanism": "Bordetella pertussis kaynaklı solunum enfeksiyonu",
    "dnaRelation": {
      "kind": "response",
      "explanation": "İnsan DNA dizisi değiştirilmez; hücresel yanıt kavramsal gösterilir.",
      "sourceUrl": "https://medlineplus.gov/whoopingcough.html"
    },
    "contagious": true,
    "publicSpreadApplicable": true,
    "spreadModelNote": "Toplum görünümü soyut maruziyet eğilimini gösterir; gerçek bulaşma yolu veya epidemiyolojik tahmin değildir.",
    "educationalTimeline": [
      {
        "phase": "baseline",
        "label": "Başlangıç ve mekanizma",
        "start": 0,
        "end": 2
      },
      {
        "phase": "response",
        "label": "Belirti ve hücresel etki",
        "start": 3,
        "end": 7
      },
      {
        "phase": "observation",
        "label": "İzlem ve karşılaştırma",
        "start": 8,
        "end": 14
      }
    ],
    "timelineDisclaimer": "0–14 eğitim adımı gerçek kuluçka, hastalık süresi veya prognoz tahmini değildir. Kronik hastalıklar hızlandırılmış kavramsal adımlarla gösterilir.",
    "sources": [
      {
        "title": "MedlinePlus: Whooping Cough",
        "url": "https://medlineplus.gov/whoopingcough.html",
        "accessedAt": "2026-10-12",
        "sourceDate": "2026-10-10"
      }
    ],
    "educationalParameters": {
      "units": "abstract-0-100",
      "incubationSteps": 2,
      "severity": 55,
      "inflammation": 35,
      "tissueDamage": 30,
      "durationSteps": 14,
      "immuneEvasion": 20,
      "transmissionTendency": 40
    }
  },
  {
    "id": "lyme",
    "name": "Lyme hastalığı",
    "category": "bacterial",
    "mechanism": "infectious/bacterial",
    "profileType": "real",
    "codePrefix": "D16",
    "description": "Kene ile taşınan bakteriyel enfeksiyon",
    "initialDiagnosis": "Mekanizma hipotezi; gözlemler değerlendiriliyor",
    "growth": 1.2,
    "immuneRate": 1,
    "tissueRate": 1.4,
    "affectedSystems": [
      "skin",
      "neurological"
    ],
    "typicalSymptoms": [
      "Döküntü",
      "Eklem ağrısı"
    ],
    "symptomProfile": {
      "skin": 15,
      "neurological": 15
    },
    "immuneResponseType": "Doğal ve edinilmiş antibakteriyel yanıt",
    "cellularMechanism": "Kene ile taşınan bakteriyel enfeksiyon",
    "dnaRelation": {
      "kind": "response",
      "explanation": "İnsan DNA dizisi değiştirilmez; hücresel yanıt kavramsal gösterilir.",
      "sourceUrl": "https://medlineplus.gov/lymedisease.html"
    },
    "contagious": false,
    "publicSpreadApplicable": false,
    "spreadModelNote": "Toplum görünümü soyut maruziyet eğilimini gösterir; gerçek bulaşma yolu veya epidemiyolojik tahmin değildir.",
    "educationalTimeline": [
      {
        "phase": "baseline",
        "label": "Başlangıç ve mekanizma",
        "start": 0,
        "end": 2
      },
      {
        "phase": "response",
        "label": "Belirti ve hücresel etki",
        "start": 3,
        "end": 7
      },
      {
        "phase": "observation",
        "label": "İzlem ve karşılaştırma",
        "start": 8,
        "end": 14
      }
    ],
    "timelineDisclaimer": "0–14 eğitim adımı gerçek kuluçka, hastalık süresi veya prognoz tahmini değildir. Kronik hastalıklar hızlandırılmış kavramsal adımlarla gösterilir.",
    "sources": [
      {
        "title": "MedlinePlus: Lyme Disease",
        "url": "https://medlineplus.gov/lymedisease.html",
        "accessedAt": "2026-10-12",
        "sourceDate": "2026-10-10"
      }
    ],
    "educationalParameters": {
      "units": "abstract-0-100",
      "incubationSteps": 2,
      "severity": 55,
      "inflammation": 35,
      "tissueDamage": 30,
      "durationSteps": 14,
      "immuneEvasion": 20,
      "transmissionTendency": 0
    }
  },
  {
    "id": "tetanus",
    "name": "Tetanos",
    "category": "bacterial",
    "mechanism": "infectious/bacterial",
    "profileType": "real",
    "codePrefix": "D17",
    "description": "Yaradan giren Clostridium bakterilerine bağlı kas tutulumu",
    "initialDiagnosis": "Mekanizma hipotezi; gözlemler değerlendiriliyor",
    "growth": 1.2,
    "immuneRate": 1,
    "tissueRate": 1.4,
    "affectedSystems": [
      "muscular"
    ],
    "typicalSymptoms": [
      "Kas kasılmaları",
      "Çene kilitlenmesi"
    ],
    "symptomProfile": {
      "muscular": 15
    },
    "immuneResponseType": "Doğal ve edinilmiş antibakteriyel yanıt",
    "cellularMechanism": "Yaradan giren Clostridium bakterilerine bağlı kas tutulumu",
    "dnaRelation": {
      "kind": "response",
      "explanation": "İnsan DNA dizisi değiştirilmez; hücresel yanıt kavramsal gösterilir.",
      "sourceUrl": "https://medlineplus.gov/tetanus.html"
    },
    "contagious": false,
    "publicSpreadApplicable": false,
    "spreadModelNote": "Toplum görünümü soyut maruziyet eğilimini gösterir; gerçek bulaşma yolu veya epidemiyolojik tahmin değildir.",
    "educationalTimeline": [
      {
        "phase": "baseline",
        "label": "Başlangıç ve mekanizma",
        "start": 0,
        "end": 2
      },
      {
        "phase": "response",
        "label": "Belirti ve hücresel etki",
        "start": 3,
        "end": 7
      },
      {
        "phase": "observation",
        "label": "İzlem ve karşılaştırma",
        "start": 8,
        "end": 14
      }
    ],
    "timelineDisclaimer": "0–14 eğitim adımı gerçek kuluçka, hastalık süresi veya prognoz tahmini değildir. Kronik hastalıklar hızlandırılmış kavramsal adımlarla gösterilir.",
    "sources": [
      {
        "title": "MedlinePlus: Tetanus",
        "url": "https://medlineplus.gov/tetanus.html",
        "accessedAt": "2026-10-12",
        "sourceDate": "2026-10-10"
      }
    ],
    "educationalParameters": {
      "units": "abstract-0-100",
      "incubationSteps": 2,
      "severity": 55,
      "inflammation": 35,
      "tissueDamage": 30,
      "durationSteps": 14,
      "immuneEvasion": 20,
      "transmissionTendency": 0
    }
  },
  {
    "id": "diphtheria",
    "name": "Difteri",
    "category": "bacterial",
    "mechanism": "infectious/bacterial",
    "profileType": "real",
    "codePrefix": "D18",
    "description": "Burun ve boğazı etkileyen bakteriyel enfeksiyon",
    "initialDiagnosis": "Mekanizma hipotezi; gözlemler değerlendiriliyor",
    "growth": 1.2,
    "immuneRate": 1,
    "tissueRate": 1.4,
    "affectedSystems": [
      "respiratory"
    ],
    "typicalSymptoms": [
      "Boğaz ağrısı",
      "Ateş"
    ],
    "symptomProfile": {
      "respiratory": 15
    },
    "immuneResponseType": "Doğal ve edinilmiş antibakteriyel yanıt",
    "cellularMechanism": "Burun ve boğazı etkileyen bakteriyel enfeksiyon",
    "dnaRelation": {
      "kind": "response",
      "explanation": "İnsan DNA dizisi değiştirilmez; hücresel yanıt kavramsal gösterilir.",
      "sourceUrl": "https://medlineplus.gov/diphtheria.html"
    },
    "contagious": true,
    "publicSpreadApplicable": true,
    "spreadModelNote": "Toplum görünümü soyut maruziyet eğilimini gösterir; gerçek bulaşma yolu veya epidemiyolojik tahmin değildir.",
    "educationalTimeline": [
      {
        "phase": "baseline",
        "label": "Başlangıç ve mekanizma",
        "start": 0,
        "end": 2
      },
      {
        "phase": "response",
        "label": "Belirti ve hücresel etki",
        "start": 3,
        "end": 7
      },
      {
        "phase": "observation",
        "label": "İzlem ve karşılaştırma",
        "start": 8,
        "end": 14
      }
    ],
    "timelineDisclaimer": "0–14 eğitim adımı gerçek kuluçka, hastalık süresi veya prognoz tahmini değildir. Kronik hastalıklar hızlandırılmış kavramsal adımlarla gösterilir.",
    "sources": [
      {
        "title": "MedlinePlus: Diphtheria",
        "url": "https://medlineplus.gov/diphtheria.html",
        "accessedAt": "2026-10-12",
        "sourceDate": "2026-10-10"
      }
    ],
    "educationalParameters": {
      "units": "abstract-0-100",
      "incubationSteps": 2,
      "severity": 55,
      "inflammation": 35,
      "tissueDamage": 30,
      "durationSteps": 14,
      "immuneEvasion": 20,
      "transmissionTendency": 40
    }
  },
  {
    "id": "salmonellosis",
    "name": "Salmonella enfeksiyonu",
    "category": "bacterial",
    "mechanism": "infectious/bacterial",
    "profileType": "real",
    "codePrefix": "D19",
    "description": "Gıda veya hayvan temasıyla edinilen bakteriyel enfeksiyon",
    "initialDiagnosis": "Mekanizma hipotezi; gözlemler değerlendiriliyor",
    "growth": 1.2,
    "immuneRate": 1,
    "tissueRate": 1.4,
    "affectedSystems": [
      "digestive"
    ],
    "typicalSymptoms": [
      "İshal",
      "Ateş"
    ],
    "symptomProfile": {
      "digestive": 15
    },
    "immuneResponseType": "Doğal ve edinilmiş antibakteriyel yanıt",
    "cellularMechanism": "Gıda veya hayvan temasıyla edinilen bakteriyel enfeksiyon",
    "dnaRelation": {
      "kind": "response",
      "explanation": "İnsan DNA dizisi değiştirilmez; hücresel yanıt kavramsal gösterilir.",
      "sourceUrl": "https://medlineplus.gov/salmonellainfections.html"
    },
    "contagious": true,
    "publicSpreadApplicable": true,
    "spreadModelNote": "Toplum görünümü soyut maruziyet eğilimini gösterir; gerçek bulaşma yolu veya epidemiyolojik tahmin değildir.",
    "educationalTimeline": [
      {
        "phase": "baseline",
        "label": "Başlangıç ve mekanizma",
        "start": 0,
        "end": 2
      },
      {
        "phase": "response",
        "label": "Belirti ve hücresel etki",
        "start": 3,
        "end": 7
      },
      {
        "phase": "observation",
        "label": "İzlem ve karşılaştırma",
        "start": 8,
        "end": 14
      }
    ],
    "timelineDisclaimer": "0–14 eğitim adımı gerçek kuluçka, hastalık süresi veya prognoz tahmini değildir. Kronik hastalıklar hızlandırılmış kavramsal adımlarla gösterilir.",
    "sources": [
      {
        "title": "MedlinePlus: Salmonella Infections",
        "url": "https://medlineplus.gov/salmonellainfections.html",
        "accessedAt": "2026-10-12",
        "sourceDate": "2026-10-10"
      }
    ],
    "educationalParameters": {
      "units": "abstract-0-100",
      "incubationSteps": 2,
      "severity": 55,
      "inflammation": 35,
      "tissueDamage": 30,
      "durationSteps": 14,
      "immuneEvasion": 20,
      "transmissionTendency": 40
    }
  },
  {
    "id": "gonorrhea",
    "name": "Gonore",
    "category": "bacterial",
    "mechanism": "infectious/bacterial",
    "profileType": "real",
    "codePrefix": "D20",
    "description": "Genital bölge, ağız veya anüsü tutabilen bakteriyel enfeksiyon",
    "initialDiagnosis": "Mekanizma hipotezi; gözlemler değerlendiriliyor",
    "growth": 1.2,
    "immuneRate": 1,
    "tissueRate": 1.4,
    "affectedSystems": [
      "reproductive"
    ],
    "typicalSymptoms": [
      "İdrar yaparken ağrı",
      "Akıntı"
    ],
    "symptomProfile": {
      "reproductive": 15
    },
    "immuneResponseType": "Doğal ve edinilmiş antibakteriyel yanıt",
    "cellularMechanism": "Genital bölge, ağız veya anüsü tutabilen bakteriyel enfeksiyon",
    "dnaRelation": {
      "kind": "response",
      "explanation": "İnsan DNA dizisi değiştirilmez; hücresel yanıt kavramsal gösterilir.",
      "sourceUrl": "https://medlineplus.gov/gonorrhea.html"
    },
    "contagious": true,
    "publicSpreadApplicable": true,
    "spreadModelNote": "Toplum görünümü soyut maruziyet eğilimini gösterir; gerçek bulaşma yolu veya epidemiyolojik tahmin değildir.",
    "educationalTimeline": [
      {
        "phase": "baseline",
        "label": "Başlangıç ve mekanizma",
        "start": 0,
        "end": 2
      },
      {
        "phase": "response",
        "label": "Belirti ve hücresel etki",
        "start": 3,
        "end": 7
      },
      {
        "phase": "observation",
        "label": "İzlem ve karşılaştırma",
        "start": 8,
        "end": 14
      }
    ],
    "timelineDisclaimer": "0–14 eğitim adımı gerçek kuluçka, hastalık süresi veya prognoz tahmini değildir. Kronik hastalıklar hızlandırılmış kavramsal adımlarla gösterilir.",
    "sources": [
      {
        "title": "MedlinePlus: Gonorrhea",
        "url": "https://medlineplus.gov/gonorrhea.html",
        "accessedAt": "2026-10-12",
        "sourceDate": "2026-10-10"
      }
    ],
    "educationalParameters": {
      "units": "abstract-0-100",
      "incubationSteps": 2,
      "severity": 55,
      "inflammation": 35,
      "tissueDamage": 30,
      "durationSteps": 14,
      "immuneEvasion": 20,
      "transmissionTendency": 40
    }
  },
  {
    "id": "syphilis",
    "name": "Sifiliz",
    "category": "bacterial",
    "mechanism": "infectious/bacterial",
    "profileType": "real",
    "codePrefix": "D21",
    "description": "Evrelerle ilerleyebilen bakteriyel enfeksiyon",
    "initialDiagnosis": "Mekanizma hipotezi; gözlemler değerlendiriliyor",
    "growth": 1.2,
    "immuneRate": 1,
    "tissueRate": 1.4,
    "affectedSystems": [
      "skin",
      "systemic"
    ],
    "typicalSymptoms": [
      "Ağrısız yara",
      "Döküntü"
    ],
    "symptomProfile": {
      "skin": 15,
      "systemic": 15
    },
    "immuneResponseType": "Doğal ve edinilmiş antibakteriyel yanıt",
    "cellularMechanism": "Evrelerle ilerleyebilen bakteriyel enfeksiyon",
    "dnaRelation": {
      "kind": "response",
      "explanation": "İnsan DNA dizisi değiştirilmez; hücresel yanıt kavramsal gösterilir.",
      "sourceUrl": "https://medlineplus.gov/syphilis.html"
    },
    "contagious": true,
    "publicSpreadApplicable": true,
    "spreadModelNote": "Toplum görünümü soyut maruziyet eğilimini gösterir; gerçek bulaşma yolu veya epidemiyolojik tahmin değildir.",
    "educationalTimeline": [
      {
        "phase": "baseline",
        "label": "Başlangıç ve mekanizma",
        "start": 0,
        "end": 2
      },
      {
        "phase": "response",
        "label": "Belirti ve hücresel etki",
        "start": 3,
        "end": 7
      },
      {
        "phase": "observation",
        "label": "İzlem ve karşılaştırma",
        "start": 8,
        "end": 14
      }
    ],
    "timelineDisclaimer": "0–14 eğitim adımı gerçek kuluçka, hastalık süresi veya prognoz tahmini değildir. Kronik hastalıklar hızlandırılmış kavramsal adımlarla gösterilir.",
    "sources": [
      {
        "title": "MedlinePlus: Syphilis",
        "url": "https://medlineplus.gov/syphilis.html",
        "accessedAt": "2026-10-12",
        "sourceDate": "2026-10-10"
      }
    ],
    "educationalParameters": {
      "units": "abstract-0-100",
      "incubationSteps": 2,
      "severity": 55,
      "inflammation": 35,
      "tissueDamage": 30,
      "durationSteps": 14,
      "immuneEvasion": 20,
      "transmissionTendency": 40
    }
  },
  {
    "id": "sickle-cell",
    "name": "Orak hücre hastalığı",
    "category": "genetic",
    "mechanism": "genetic",
    "profileType": "real",
    "codePrefix": "HBB",
    "description": "Hemoglobin bozukluğu eritrosit biçimini ve oksijen taşınmasını etkiler",
    "initialDiagnosis": "Mekanizma hipotezi; gözlemler değerlendiriliyor",
    "growth": 1,
    "immuneRate": 0,
    "proteinBaseline": 58,
    "tissueRate": 1.8,
    "affectedSystems": [
      "systemic"
    ],
    "typicalSymptoms": [
      "Ağrı",
      "Anemi"
    ],
    "symptomProfile": {
      "systemic": 15
    },
    "immuneResponseType": "Birincil neden kalıtsal işlev bozukluğudur; inflamasyon ikincil olabilir",
    "cellularMechanism": "Hemoglobin bozukluğu eritrosit biçimini ve oksijen taşınmasını etkiler",
    "dnaRelation": {
      "kind": "genetic",
      "presetId": "sickle-cell",
      "explanation": "HBB varyantı hemoglobin işlevini etkiler; DNA Lab missense değişiminin eğitim analoğunu gösterir.",
      "sourceUrl": "https://medlineplus.gov/sicklecelldisease.html"
    },
    "contagious": false,
    "publicSpreadApplicable": false,
    "spreadModelNote": "Toplum görünümü soyut maruziyet eğilimini gösterir; gerçek bulaşma yolu veya epidemiyolojik tahmin değildir.",
    "educationalTimeline": [
      {
        "phase": "baseline",
        "label": "Başlangıç ve mekanizma",
        "start": 0,
        "end": 2
      },
      {
        "phase": "response",
        "label": "Belirti ve hücresel etki",
        "start": 3,
        "end": 7
      },
      {
        "phase": "observation",
        "label": "İzlem ve karşılaştırma",
        "start": 8,
        "end": 14
      }
    ],
    "timelineDisclaimer": "0–14 eğitim adımı gerçek kuluçka, hastalık süresi veya prognoz tahmini değildir. Kronik hastalıklar hızlandırılmış kavramsal adımlarla gösterilir.",
    "sources": [
      {
        "title": "MedlinePlus: Sickle Cell Disease",
        "url": "https://medlineplus.gov/sicklecelldisease.html",
        "accessedAt": "2026-10-12",
        "sourceDate": "2026-10-10"
      }
    ],
    "educationalParameters": {
      "units": "abstract-0-100",
      "incubationSteps": 0,
      "severity": 55,
      "inflammation": 35,
      "tissueDamage": 45,
      "durationSteps": 14,
      "immuneEvasion": 20,
      "transmissionTendency": 0
    }
  },
  {
    "id": "cystic-fibrosis",
    "name": "Kistik fibrozis",
    "category": "genetic",
    "mechanism": "genetic",
    "profileType": "real",
    "codePrefix": "CFR",
    "description": "Kalıtsal hastalık kalın mukus oluşumuyla organları etkiler",
    "initialDiagnosis": "Mekanizma hipotezi; gözlemler değerlendiriliyor",
    "growth": 1,
    "immuneRate": 0,
    "proteinBaseline": 42,
    "tissueRate": 2.1,
    "affectedSystems": [
      "respiratory",
      "digestive"
    ],
    "typicalSymptoms": [
      "Öksürük",
      "Sindirim sorunları"
    ],
    "symptomProfile": {
      "respiratory": 15,
      "digestive": 15
    },
    "immuneResponseType": "Birincil neden kalıtsal işlev bozukluğudur; inflamasyon ikincil olabilir",
    "cellularMechanism": "Kalıtsal hastalık kalın mukus oluşumuyla organları etkiler",
    "dnaRelation": {
      "kind": "genetic",
      "presetId": "cystic-fibrosis",
      "explanation": "CFTR varyantları iyon taşınmasını etkiler; DNA Lab kodon silinmesinin eğitim analoğunu gösterir.",
      "sourceUrl": "https://medlineplus.gov/cysticfibrosis.html"
    },
    "contagious": false,
    "publicSpreadApplicable": false,
    "spreadModelNote": "Toplum görünümü soyut maruziyet eğilimini gösterir; gerçek bulaşma yolu veya epidemiyolojik tahmin değildir.",
    "educationalTimeline": [
      {
        "phase": "baseline",
        "label": "Başlangıç ve mekanizma",
        "start": 0,
        "end": 2
      },
      {
        "phase": "response",
        "label": "Belirti ve hücresel etki",
        "start": 3,
        "end": 7
      },
      {
        "phase": "observation",
        "label": "İzlem ve karşılaştırma",
        "start": 8,
        "end": 14
      }
    ],
    "timelineDisclaimer": "0–14 eğitim adımı gerçek kuluçka, hastalık süresi veya prognoz tahmini değildir. Kronik hastalıklar hızlandırılmış kavramsal adımlarla gösterilir.",
    "sources": [
      {
        "title": "MedlinePlus: Cystic Fibrosis",
        "url": "https://medlineplus.gov/cysticfibrosis.html",
        "accessedAt": "2026-10-12",
        "sourceDate": "2026-10-10"
      }
    ],
    "educationalParameters": {
      "units": "abstract-0-100",
      "incubationSteps": 0,
      "severity": 55,
      "inflammation": 35,
      "tissueDamage": 45,
      "durationSteps": 14,
      "immuneEvasion": 20,
      "transmissionTendency": 0
    }
  },
  {
    "id": "huntington",
    "name": "Huntington hastalığı",
    "category": "genetic",
    "mechanism": "genetic",
    "profileType": "real",
    "codePrefix": "HTT",
    "description": "Kalıtsal sinir hücresi kaybı",
    "initialDiagnosis": "Mekanizma hipotezi; gözlemler değerlendiriliyor",
    "growth": 1,
    "immuneRate": 0,
    "proteinBaseline": 65,
    "tissueRate": 1.4,
    "affectedSystems": [
      "neurological"
    ],
    "typicalSymptoms": [
      "İstemsiz hareketler",
      "Denge bozukluğu"
    ],
    "symptomProfile": {
      "neurological": 15
    },
    "immuneResponseType": "Birincil neden kalıtsal işlev bozukluğudur; inflamasyon ikincil olabilir",
    "cellularMechanism": "Kalıtsal sinir hücresi kaybı",
    "dnaRelation": {
      "kind": "genetic",
      "presetId": "huntington",
      "explanation": "HTT tekrar genişlemesi protein etkisine yol açar; DNA Lab kavramsal tekrar eklemesini gösterir.",
      "sourceUrl": "https://medlineplus.gov/huntingtonsdisease.html"
    },
    "contagious": false,
    "publicSpreadApplicable": false,
    "spreadModelNote": "Toplum görünümü soyut maruziyet eğilimini gösterir; gerçek bulaşma yolu veya epidemiyolojik tahmin değildir.",
    "educationalTimeline": [
      {
        "phase": "baseline",
        "label": "Başlangıç ve mekanizma",
        "start": 0,
        "end": 2
      },
      {
        "phase": "response",
        "label": "Belirti ve hücresel etki",
        "start": 3,
        "end": 7
      },
      {
        "phase": "observation",
        "label": "İzlem ve karşılaştırma",
        "start": 8,
        "end": 14
      }
    ],
    "timelineDisclaimer": "0–14 eğitim adımı gerçek kuluçka, hastalık süresi veya prognoz tahmini değildir. Kronik hastalıklar hızlandırılmış kavramsal adımlarla gösterilir.",
    "sources": [
      {
        "title": "MedlinePlus: Huntington's Disease",
        "url": "https://medlineplus.gov/huntingtonsdisease.html",
        "accessedAt": "2026-10-12",
        "sourceDate": "2026-10-10"
      }
    ],
    "educationalParameters": {
      "units": "abstract-0-100",
      "incubationSteps": 0,
      "severity": 55,
      "inflammation": 35,
      "tissueDamage": 45,
      "durationSteps": 14,
      "immuneEvasion": 20,
      "transmissionTendency": 0
    }
  },
  {
    "id": "dmd",
    "name": "Duchenne musküler distrofi",
    "category": "genetic",
    "mechanism": "genetic",
    "profileType": "real",
    "codePrefix": "DMD",
    "description": "Çocuklukta başlayan genetik kas hastalığı",
    "initialDiagnosis": "Mekanizma hipotezi; gözlemler değerlendiriliyor",
    "growth": 1,
    "immuneRate": 0,
    "proteinBaseline": 30,
    "tissueRate": 2.5,
    "affectedSystems": [
      "muscular",
      "respiratory"
    ],
    "typicalSymptoms": [
      "Kas güçsüzlüğü"
    ],
    "symptomProfile": {
      "muscular": 15,
      "respiratory": 15
    },
    "immuneResponseType": "Birincil neden kalıtsal işlev bozukluğudur; inflamasyon ikincil olabilir",
    "cellularMechanism": "Çocuklukta başlayan genetik kas hastalığı",
    "dnaRelation": {
      "kind": "genetic",
      "presetId": "dmd",
      "explanation": "Distrofin işlevindeki kayıp; DNA Lab okuma çerçevesini bozan silmenin eğitim analoğunu gösterir.",
      "sourceUrl": "https://medlineplus.gov/musculardystrophy.html"
    },
    "contagious": false,
    "publicSpreadApplicable": false,
    "spreadModelNote": "Toplum görünümü soyut maruziyet eğilimini gösterir; gerçek bulaşma yolu veya epidemiyolojik tahmin değildir.",
    "educationalTimeline": [
      {
        "phase": "baseline",
        "label": "Başlangıç ve mekanizma",
        "start": 0,
        "end": 2
      },
      {
        "phase": "response",
        "label": "Belirti ve hücresel etki",
        "start": 3,
        "end": 7
      },
      {
        "phase": "observation",
        "label": "İzlem ve karşılaştırma",
        "start": 8,
        "end": 14
      }
    ],
    "timelineDisclaimer": "0–14 eğitim adımı gerçek kuluçka, hastalık süresi veya prognoz tahmini değildir. Kronik hastalıklar hızlandırılmış kavramsal adımlarla gösterilir.",
    "sources": [
      {
        "title": "MedlinePlus: Muscular Dystrophy",
        "url": "https://medlineplus.gov/musculardystrophy.html",
        "accessedAt": "2026-10-12",
        "sourceDate": "2026-10-10"
      }
    ],
    "educationalParameters": {
      "units": "abstract-0-100",
      "incubationSteps": 0,
      "severity": 55,
      "inflammation": 35,
      "tissueDamage": 45,
      "durationSteps": 14,
      "immuneEvasion": 20,
      "transmissionTendency": 0
    }
  },
  {
    "id": "hemophilia",
    "name": "Hemofili",
    "category": "genetic",
    "mechanism": "genetic",
    "profileType": "real",
    "codePrefix": "D26",
    "description": "Pıhtılaşma faktörlerinin yetersizliği",
    "initialDiagnosis": "Mekanizma hipotezi; gözlemler değerlendiriliyor",
    "growth": 1,
    "immuneRate": 0,
    "proteinBaseline": 60,
    "tissueRate": 1.4,
    "affectedSystems": [
      "systemic"
    ],
    "typicalSymptoms": [
      "Uzayan kanama",
      "Eklem kanaması"
    ],
    "symptomProfile": {
      "systemic": 15
    },
    "immuneResponseType": "Birincil neden kalıtsal işlev bozukluğudur; inflamasyon ikincil olabilir",
    "cellularMechanism": "Pıhtılaşma faktörlerinin yetersizliği",
    "dnaRelation": {
      "kind": "genetic",
      "explanation": "Kalıtsal mekanizma; DNA Lab için özel varyant analoğu tanımlanmadı.",
      "sourceUrl": "https://medlineplus.gov/hemophilia.html"
    },
    "contagious": false,
    "publicSpreadApplicable": false,
    "spreadModelNote": "Toplum görünümü soyut maruziyet eğilimini gösterir; gerçek bulaşma yolu veya epidemiyolojik tahmin değildir.",
    "educationalTimeline": [
      {
        "phase": "baseline",
        "label": "Başlangıç ve mekanizma",
        "start": 0,
        "end": 2
      },
      {
        "phase": "response",
        "label": "Belirti ve hücresel etki",
        "start": 3,
        "end": 7
      },
      {
        "phase": "observation",
        "label": "İzlem ve karşılaştırma",
        "start": 8,
        "end": 14
      }
    ],
    "timelineDisclaimer": "0–14 eğitim adımı gerçek kuluçka, hastalık süresi veya prognoz tahmini değildir. Kronik hastalıklar hızlandırılmış kavramsal adımlarla gösterilir.",
    "sources": [
      {
        "title": "MedlinePlus: Hemophilia",
        "url": "https://medlineplus.gov/hemophilia.html",
        "accessedAt": "2026-10-12",
        "sourceDate": "2026-10-10"
      }
    ],
    "educationalParameters": {
      "units": "abstract-0-100",
      "incubationSteps": 0,
      "severity": 55,
      "inflammation": 35,
      "tissueDamage": 45,
      "durationSteps": 14,
      "immuneEvasion": 20,
      "transmissionTendency": 0
    }
  },
  {
    "id": "pku",
    "name": "Fenilketonüri",
    "category": "genetic",
    "mechanism": "genetic",
    "profileType": "real",
    "codePrefix": "D27",
    "description": "Kalıtsal fenilalanin metabolizması bozukluğu",
    "initialDiagnosis": "Mekanizma hipotezi; gözlemler değerlendiriliyor",
    "growth": 1,
    "immuneRate": 0,
    "proteinBaseline": 60,
    "tissueRate": 1.4,
    "affectedSystems": [
      "metabolic",
      "neurological"
    ],
    "typicalSymptoms": [
      "Gelişim sorunları"
    ],
    "symptomProfile": {
      "metabolic": 15,
      "neurological": 15
    },
    "immuneResponseType": "Birincil neden kalıtsal işlev bozukluğudur; inflamasyon ikincil olabilir",
    "cellularMechanism": "Kalıtsal fenilalanin metabolizması bozukluğu",
    "dnaRelation": {
      "kind": "genetic",
      "explanation": "Kalıtsal mekanizma; DNA Lab için özel varyant analoğu tanımlanmadı.",
      "sourceUrl": "https://medlineplus.gov/phenylketonuria.html"
    },
    "contagious": false,
    "publicSpreadApplicable": false,
    "spreadModelNote": "Toplum görünümü soyut maruziyet eğilimini gösterir; gerçek bulaşma yolu veya epidemiyolojik tahmin değildir.",
    "educationalTimeline": [
      {
        "phase": "baseline",
        "label": "Başlangıç ve mekanizma",
        "start": 0,
        "end": 2
      },
      {
        "phase": "response",
        "label": "Belirti ve hücresel etki",
        "start": 3,
        "end": 7
      },
      {
        "phase": "observation",
        "label": "İzlem ve karşılaştırma",
        "start": 8,
        "end": 14
      }
    ],
    "timelineDisclaimer": "0–14 eğitim adımı gerçek kuluçka, hastalık süresi veya prognoz tahmini değildir. Kronik hastalıklar hızlandırılmış kavramsal adımlarla gösterilir.",
    "sources": [
      {
        "title": "MedlinePlus: Phenylketonuria",
        "url": "https://medlineplus.gov/phenylketonuria.html",
        "accessedAt": "2026-10-12",
        "sourceDate": "2026-10-10"
      }
    ],
    "educationalParameters": {
      "units": "abstract-0-100",
      "incubationSteps": 0,
      "severity": 55,
      "inflammation": 35,
      "tissueDamage": 45,
      "durationSteps": 14,
      "immuneEvasion": 20,
      "transmissionTendency": 0
    }
  },
  {
    "id": "marfan",
    "name": "Marfan sendromu",
    "category": "genetic",
    "mechanism": "genetic",
    "profileType": "real",
    "codePrefix": "D28",
    "description": "Fibrillin geniyle ilişkili bağ dokusu bozukluğu",
    "initialDiagnosis": "Mekanizma hipotezi; gözlemler değerlendiriliyor",
    "growth": 1,
    "immuneRate": 0,
    "proteinBaseline": 60,
    "tissueRate": 1.4,
    "affectedSystems": [
      "cardiovascular",
      "muscular"
    ],
    "typicalSymptoms": [
      "Eklem gevşekliği",
      "Damar sorunları"
    ],
    "symptomProfile": {
      "cardiovascular": 15,
      "muscular": 15
    },
    "immuneResponseType": "Birincil neden kalıtsal işlev bozukluğudur; inflamasyon ikincil olabilir",
    "cellularMechanism": "Fibrillin geniyle ilişkili bağ dokusu bozukluğu",
    "dnaRelation": {
      "kind": "genetic",
      "explanation": "Kalıtsal mekanizma; DNA Lab için özel varyant analoğu tanımlanmadı.",
      "sourceUrl": "https://medlineplus.gov/marfansyndrome.html"
    },
    "contagious": false,
    "publicSpreadApplicable": false,
    "spreadModelNote": "Toplum görünümü soyut maruziyet eğilimini gösterir; gerçek bulaşma yolu veya epidemiyolojik tahmin değildir.",
    "educationalTimeline": [
      {
        "phase": "baseline",
        "label": "Başlangıç ve mekanizma",
        "start": 0,
        "end": 2
      },
      {
        "phase": "response",
        "label": "Belirti ve hücresel etki",
        "start": 3,
        "end": 7
      },
      {
        "phase": "observation",
        "label": "İzlem ve karşılaştırma",
        "start": 8,
        "end": 14
      }
    ],
    "timelineDisclaimer": "0–14 eğitim adımı gerçek kuluçka, hastalık süresi veya prognoz tahmini değildir. Kronik hastalıklar hızlandırılmış kavramsal adımlarla gösterilir.",
    "sources": [
      {
        "title": "MedlinePlus: Marfan Syndrome",
        "url": "https://medlineplus.gov/marfansyndrome.html",
        "accessedAt": "2026-10-12",
        "sourceDate": "2026-10-10"
      }
    ],
    "educationalParameters": {
      "units": "abstract-0-100",
      "incubationSteps": 0,
      "severity": 55,
      "inflammation": 35,
      "tissueDamage": 45,
      "durationSteps": 14,
      "immuneEvasion": 20,
      "transmissionTendency": 0
    }
  },
  {
    "id": "tay-sachs",
    "name": "Tay-Sachs hastalığı",
    "category": "genetic",
    "mechanism": "genetic",
    "profileType": "real",
    "codePrefix": "D29",
    "description": "Kalıtsal lipid metabolizması bozukluğu sinir hücrelerine zarar verir",
    "initialDiagnosis": "Mekanizma hipotezi; gözlemler değerlendiriliyor",
    "growth": 1,
    "immuneRate": 0,
    "proteinBaseline": 60,
    "tissueRate": 1.4,
    "affectedSystems": [
      "neurological"
    ],
    "typicalSymptoms": [
      "Gelişimsel gerileme",
      "Kas güçsüzlüğü"
    ],
    "symptomProfile": {
      "neurological": 15
    },
    "immuneResponseType": "Birincil neden kalıtsal işlev bozukluğudur; inflamasyon ikincil olabilir",
    "cellularMechanism": "Kalıtsal lipid metabolizması bozukluğu sinir hücrelerine zarar verir",
    "dnaRelation": {
      "kind": "genetic",
      "explanation": "Kalıtsal mekanizma; DNA Lab için özel varyant analoğu tanımlanmadı.",
      "sourceUrl": "https://medlineplus.gov/taysachsdisease.html"
    },
    "contagious": false,
    "publicSpreadApplicable": false,
    "spreadModelNote": "Toplum görünümü soyut maruziyet eğilimini gösterir; gerçek bulaşma yolu veya epidemiyolojik tahmin değildir.",
    "educationalTimeline": [
      {
        "phase": "baseline",
        "label": "Başlangıç ve mekanizma",
        "start": 0,
        "end": 2
      },
      {
        "phase": "response",
        "label": "Belirti ve hücresel etki",
        "start": 3,
        "end": 7
      },
      {
        "phase": "observation",
        "label": "İzlem ve karşılaştırma",
        "start": 8,
        "end": 14
      }
    ],
    "timelineDisclaimer": "0–14 eğitim adımı gerçek kuluçka, hastalık süresi veya prognoz tahmini değildir. Kronik hastalıklar hızlandırılmış kavramsal adımlarla gösterilir.",
    "sources": [
      {
        "title": "MedlinePlus: Tay-Sachs Disease",
        "url": "https://medlineplus.gov/taysachsdisease.html",
        "accessedAt": "2026-10-12",
        "sourceDate": "2026-10-10"
      }
    ],
    "educationalParameters": {
      "units": "abstract-0-100",
      "incubationSteps": 0,
      "severity": 55,
      "inflammation": 35,
      "tissueDamage": 45,
      "durationSteps": 14,
      "immuneEvasion": 20,
      "transmissionTendency": 0
    }
  },
  {
    "id": "rheumatoid",
    "name": "Romatoid artrit",
    "category": "autoimmune",
    "mechanism": "autoimmune",
    "profileType": "real",
    "codePrefix": "D30",
    "description": "Bağışıklık sisteminin eklem dokularına yönelmesi",
    "initialDiagnosis": "Mekanizma hipotezi; gözlemler değerlendiriliyor",
    "growth": 1,
    "immuneRate": 0,
    "tissueRate": 1.4,
    "affectedSystems": [
      "muscular"
    ],
    "typicalSymptoms": [
      "Eklem ağrısı",
      "Tutukluk"
    ],
    "symptomProfile": {
      "muscular": 15
    },
    "immuneResponseType": "Öz dokuya yönelen bağışıklık yanıtı",
    "cellularMechanism": "Bağışıklık sisteminin eklem dokularına yönelmesi",
    "dnaRelation": {
      "kind": "response",
      "explanation": "İnsan DNA dizisi değiştirilmez; hücresel yanıt kavramsal gösterilir.",
      "sourceUrl": "https://medlineplus.gov/rheumatoidarthritis.html"
    },
    "contagious": false,
    "publicSpreadApplicable": false,
    "spreadModelNote": "Toplum görünümü soyut maruziyet eğilimini gösterir; gerçek bulaşma yolu veya epidemiyolojik tahmin değildir.",
    "educationalTimeline": [
      {
        "phase": "baseline",
        "label": "Başlangıç ve mekanizma",
        "start": 0,
        "end": 2
      },
      {
        "phase": "response",
        "label": "Belirti ve hücresel etki",
        "start": 3,
        "end": 7
      },
      {
        "phase": "observation",
        "label": "İzlem ve karşılaştırma",
        "start": 8,
        "end": 14
      }
    ],
    "timelineDisclaimer": "0–14 eğitim adımı gerçek kuluçka, hastalık süresi veya prognoz tahmini değildir. Kronik hastalıklar hızlandırılmış kavramsal adımlarla gösterilir.",
    "sources": [
      {
        "title": "MedlinePlus: Rheumatoid Arthritis",
        "url": "https://medlineplus.gov/rheumatoidarthritis.html",
        "accessedAt": "2026-10-12",
        "sourceDate": "2026-10-10"
      }
    ],
    "educationalParameters": {
      "units": "abstract-0-100",
      "incubationSteps": 0,
      "severity": 55,
      "inflammation": 70,
      "tissueDamage": 30,
      "durationSteps": 14,
      "immuneEvasion": 20,
      "transmissionTendency": 0
    }
  },
  {
    "id": "lupus",
    "name": "Sistemik lupus eritematozus",
    "category": "autoimmune",
    "mechanism": "autoimmune",
    "profileType": "real",
    "codePrefix": "D31",
    "description": "Bağışıklık sisteminin sağlıklı dokulara yönelmesi",
    "initialDiagnosis": "Mekanizma hipotezi; gözlemler değerlendiriliyor",
    "growth": 1,
    "immuneRate": 0,
    "tissueRate": 1.4,
    "affectedSystems": [
      "systemic",
      "skin",
      "renal"
    ],
    "typicalSymptoms": [
      "Yorgunluk",
      "Döküntü"
    ],
    "symptomProfile": {
      "systemic": 15,
      "skin": 15,
      "renal": 15
    },
    "immuneResponseType": "Öz dokuya yönelen bağışıklık yanıtı",
    "cellularMechanism": "Bağışıklık sisteminin sağlıklı dokulara yönelmesi",
    "dnaRelation": {
      "kind": "response",
      "explanation": "İnsan DNA dizisi değiştirilmez; hücresel yanıt kavramsal gösterilir.",
      "sourceUrl": "https://medlineplus.gov/lupus.html"
    },
    "contagious": false,
    "publicSpreadApplicable": false,
    "spreadModelNote": "Toplum görünümü soyut maruziyet eğilimini gösterir; gerçek bulaşma yolu veya epidemiyolojik tahmin değildir.",
    "educationalTimeline": [
      {
        "phase": "baseline",
        "label": "Başlangıç ve mekanizma",
        "start": 0,
        "end": 2
      },
      {
        "phase": "response",
        "label": "Belirti ve hücresel etki",
        "start": 3,
        "end": 7
      },
      {
        "phase": "observation",
        "label": "İzlem ve karşılaştırma",
        "start": 8,
        "end": 14
      }
    ],
    "timelineDisclaimer": "0–14 eğitim adımı gerçek kuluçka, hastalık süresi veya prognoz tahmini değildir. Kronik hastalıklar hızlandırılmış kavramsal adımlarla gösterilir.",
    "sources": [
      {
        "title": "MedlinePlus: Lupus",
        "url": "https://medlineplus.gov/lupus.html",
        "accessedAt": "2026-10-12",
        "sourceDate": "2026-10-10"
      }
    ],
    "educationalParameters": {
      "units": "abstract-0-100",
      "incubationSteps": 0,
      "severity": 55,
      "inflammation": 70,
      "tissueDamage": 30,
      "durationSteps": 14,
      "immuneEvasion": 20,
      "transmissionTendency": 0
    }
  },
  {
    "id": "ms",
    "name": "Multipl skleroz",
    "category": "autoimmune",
    "mechanism": "autoimmune",
    "profileType": "real",
    "codePrefix": "D32",
    "description": "Miyelin hasarının sinir iletimini bozması",
    "initialDiagnosis": "Mekanizma hipotezi; gözlemler değerlendiriliyor",
    "growth": 1,
    "immuneRate": 0,
    "tissueRate": 1.4,
    "affectedSystems": [
      "neurological"
    ],
    "typicalSymptoms": [
      "Uyuşma",
      "Güçsüzlük"
    ],
    "symptomProfile": {
      "neurological": 15
    },
    "immuneResponseType": "Öz dokuya yönelen bağışıklık yanıtı",
    "cellularMechanism": "Miyelin hasarının sinir iletimini bozması",
    "dnaRelation": {
      "kind": "response",
      "explanation": "İnsan DNA dizisi değiştirilmez; hücresel yanıt kavramsal gösterilir.",
      "sourceUrl": "https://medlineplus.gov/multiplesclerosis.html"
    },
    "contagious": false,
    "publicSpreadApplicable": false,
    "spreadModelNote": "Toplum görünümü soyut maruziyet eğilimini gösterir; gerçek bulaşma yolu veya epidemiyolojik tahmin değildir.",
    "educationalTimeline": [
      {
        "phase": "baseline",
        "label": "Başlangıç ve mekanizma",
        "start": 0,
        "end": 2
      },
      {
        "phase": "response",
        "label": "Belirti ve hücresel etki",
        "start": 3,
        "end": 7
      },
      {
        "phase": "observation",
        "label": "İzlem ve karşılaştırma",
        "start": 8,
        "end": 14
      }
    ],
    "timelineDisclaimer": "0–14 eğitim adımı gerçek kuluçka, hastalık süresi veya prognoz tahmini değildir. Kronik hastalıklar hızlandırılmış kavramsal adımlarla gösterilir.",
    "sources": [
      {
        "title": "MedlinePlus: Multiple Sclerosis",
        "url": "https://medlineplus.gov/multiplesclerosis.html",
        "accessedAt": "2026-10-12",
        "sourceDate": "2026-10-10"
      }
    ],
    "educationalParameters": {
      "units": "abstract-0-100",
      "incubationSteps": 0,
      "severity": 55,
      "inflammation": 70,
      "tissueDamage": 30,
      "durationSteps": 14,
      "immuneEvasion": 20,
      "transmissionTendency": 0
    }
  },
  {
    "id": "celiac",
    "name": "Çölyak hastalığı",
    "category": "autoimmune",
    "mechanism": "autoimmune",
    "profileType": "real",
    "codePrefix": "D33",
    "description": "Glutenle tetiklenen bağışıklık yanıtı ince bağırsakta hasar oluşturur",
    "initialDiagnosis": "Mekanizma hipotezi; gözlemler değerlendiriliyor",
    "growth": 1,
    "immuneRate": 0,
    "tissueRate": 1.4,
    "affectedSystems": [
      "digestive"
    ],
    "typicalSymptoms": [
      "İshal",
      "Emilim bozukluğu"
    ],
    "symptomProfile": {
      "digestive": 15
    },
    "immuneResponseType": "Öz dokuya yönelen bağışıklık yanıtı",
    "cellularMechanism": "Glutenle tetiklenen bağışıklık yanıtı ince bağırsakta hasar oluşturur",
    "dnaRelation": {
      "kind": "response",
      "explanation": "İnsan DNA dizisi değiştirilmez; hücresel yanıt kavramsal gösterilir.",
      "sourceUrl": "https://medlineplus.gov/celiacdisease.html"
    },
    "contagious": false,
    "publicSpreadApplicable": false,
    "spreadModelNote": "Toplum görünümü soyut maruziyet eğilimini gösterir; gerçek bulaşma yolu veya epidemiyolojik tahmin değildir.",
    "educationalTimeline": [
      {
        "phase": "baseline",
        "label": "Başlangıç ve mekanizma",
        "start": 0,
        "end": 2
      },
      {
        "phase": "response",
        "label": "Belirti ve hücresel etki",
        "start": 3,
        "end": 7
      },
      {
        "phase": "observation",
        "label": "İzlem ve karşılaştırma",
        "start": 8,
        "end": 14
      }
    ],
    "timelineDisclaimer": "0–14 eğitim adımı gerçek kuluçka, hastalık süresi veya prognoz tahmini değildir. Kronik hastalıklar hızlandırılmış kavramsal adımlarla gösterilir.",
    "sources": [
      {
        "title": "MedlinePlus: Celiac Disease",
        "url": "https://medlineplus.gov/celiacdisease.html",
        "accessedAt": "2026-10-12",
        "sourceDate": "2026-10-10"
      }
    ],
    "educationalParameters": {
      "units": "abstract-0-100",
      "incubationSteps": 0,
      "severity": 55,
      "inflammation": 70,
      "tissueDamage": 30,
      "durationSteps": 14,
      "immuneEvasion": 20,
      "transmissionTendency": 0
    }
  },
  {
    "id": "sjogren",
    "name": "Sjögren hastalığı",
    "category": "autoimmune",
    "mechanism": "autoimmune",
    "profileType": "real",
    "codePrefix": "D34",
    "description": "Bağışıklık yanıtının nem üreten bezlere yönelmesi",
    "initialDiagnosis": "Mekanizma hipotezi; gözlemler değerlendiriliyor",
    "growth": 1,
    "immuneRate": 0,
    "tissueRate": 1.4,
    "affectedSystems": [
      "systemic"
    ],
    "typicalSymptoms": [
      "Göz kuruluğu",
      "Ağız kuruluğu"
    ],
    "symptomProfile": {
      "systemic": 15
    },
    "immuneResponseType": "Öz dokuya yönelen bağışıklık yanıtı",
    "cellularMechanism": "Bağışıklık yanıtının nem üreten bezlere yönelmesi",
    "dnaRelation": {
      "kind": "response",
      "explanation": "İnsan DNA dizisi değiştirilmez; hücresel yanıt kavramsal gösterilir.",
      "sourceUrl": "https://medlineplus.gov/sjogrenssyndrome.html"
    },
    "contagious": false,
    "publicSpreadApplicable": false,
    "spreadModelNote": "Toplum görünümü soyut maruziyet eğilimini gösterir; gerçek bulaşma yolu veya epidemiyolojik tahmin değildir.",
    "educationalTimeline": [
      {
        "phase": "baseline",
        "label": "Başlangıç ve mekanizma",
        "start": 0,
        "end": 2
      },
      {
        "phase": "response",
        "label": "Belirti ve hücresel etki",
        "start": 3,
        "end": 7
      },
      {
        "phase": "observation",
        "label": "İzlem ve karşılaştırma",
        "start": 8,
        "end": 14
      }
    ],
    "timelineDisclaimer": "0–14 eğitim adımı gerçek kuluçka, hastalık süresi veya prognoz tahmini değildir. Kronik hastalıklar hızlandırılmış kavramsal adımlarla gösterilir.",
    "sources": [
      {
        "title": "MedlinePlus: Sjogren's Syndrome",
        "url": "https://medlineplus.gov/sjogrenssyndrome.html",
        "accessedAt": "2026-10-12",
        "sourceDate": "2026-10-10"
      }
    ],
    "educationalParameters": {
      "units": "abstract-0-100",
      "incubationSteps": 0,
      "severity": 55,
      "inflammation": 70,
      "tissueDamage": 30,
      "durationSteps": 14,
      "immuneEvasion": 20,
      "transmissionTendency": 0
    }
  },
  {
    "id": "type1-diabetes",
    "name": "Tip 1 diyabet",
    "category": "autoimmune",
    "mechanism": "autoimmune",
    "profileType": "real",
    "codePrefix": "D35",
    "description": "İnsülin yetersizliği glukozun hücrelere girişini azaltır",
    "initialDiagnosis": "Mekanizma hipotezi; gözlemler değerlendiriliyor",
    "growth": 1,
    "immuneRate": 0,
    "tissueRate": 1.4,
    "affectedSystems": [
      "metabolic",
      "renal"
    ],
    "typicalSymptoms": [
      "Susama",
      "Sık idrara çıkma"
    ],
    "symptomProfile": {
      "metabolic": 15,
      "renal": 15
    },
    "immuneResponseType": "Öz dokuya yönelen bağışıklık yanıtı",
    "cellularMechanism": "İnsülin yetersizliği glukozun hücrelere girişini azaltır",
    "dnaRelation": {
      "kind": "response",
      "explanation": "İnsan DNA dizisi değiştirilmez; hücresel yanıt kavramsal gösterilir.",
      "sourceUrl": "https://medlineplus.gov/diabetestype1.html"
    },
    "contagious": false,
    "publicSpreadApplicable": false,
    "spreadModelNote": "Toplum görünümü soyut maruziyet eğilimini gösterir; gerçek bulaşma yolu veya epidemiyolojik tahmin değildir.",
    "educationalTimeline": [
      {
        "phase": "baseline",
        "label": "Başlangıç ve mekanizma",
        "start": 0,
        "end": 2
      },
      {
        "phase": "response",
        "label": "Belirti ve hücresel etki",
        "start": 3,
        "end": 7
      },
      {
        "phase": "observation",
        "label": "İzlem ve karşılaştırma",
        "start": 8,
        "end": 14
      }
    ],
    "timelineDisclaimer": "0–14 eğitim adımı gerçek kuluçka, hastalık süresi veya prognoz tahmini değildir. Kronik hastalıklar hızlandırılmış kavramsal adımlarla gösterilir.",
    "sources": [
      {
        "title": "MedlinePlus: Diabetes Type 1",
        "url": "https://medlineplus.gov/diabetestype1.html",
        "accessedAt": "2026-10-12",
        "sourceDate": "2026-10-10"
      }
    ],
    "educationalParameters": {
      "units": "abstract-0-100",
      "incubationSteps": 0,
      "severity": 55,
      "inflammation": 70,
      "tissueDamage": 30,
      "durationSteps": 14,
      "immuneEvasion": 20,
      "transmissionTendency": 0
    }
  },
  {
    "id": "type2-diabetes",
    "name": "Tip 2 diyabet",
    "category": "metabolic",
    "mechanism": "metabolic",
    "profileType": "real",
    "codePrefix": "D36",
    "description": "İnsülinin yetersiz üretimi veya kullanımı",
    "initialDiagnosis": "Mekanizma hipotezi; gözlemler değerlendiriliyor",
    "growth": 1,
    "immuneRate": 0,
    "tissueRate": 1.4,
    "affectedSystems": [
      "metabolic",
      "cardiovascular"
    ],
    "typicalSymptoms": [
      "Susama",
      "Yorgunluk"
    ],
    "symptomProfile": {
      "metabolic": 15,
      "cardiovascular": 15
    },
    "immuneResponseType": "Birincil mekanizma metabolik işlevdir",
    "cellularMechanism": "İnsülinin yetersiz üretimi veya kullanımı",
    "dnaRelation": {
      "kind": "response",
      "explanation": "İnsan DNA dizisi değiştirilmez; hücresel yanıt kavramsal gösterilir.",
      "sourceUrl": "https://medlineplus.gov/diabetestype2.html"
    },
    "contagious": false,
    "publicSpreadApplicable": false,
    "spreadModelNote": "Toplum görünümü soyut maruziyet eğilimini gösterir; gerçek bulaşma yolu veya epidemiyolojik tahmin değildir.",
    "educationalTimeline": [
      {
        "phase": "baseline",
        "label": "Başlangıç ve mekanizma",
        "start": 0,
        "end": 2
      },
      {
        "phase": "response",
        "label": "Belirti ve hücresel etki",
        "start": 3,
        "end": 7
      },
      {
        "phase": "observation",
        "label": "İzlem ve karşılaştırma",
        "start": 8,
        "end": 14
      }
    ],
    "timelineDisclaimer": "0–14 eğitim adımı gerçek kuluçka, hastalık süresi veya prognoz tahmini değildir. Kronik hastalıklar hızlandırılmış kavramsal adımlarla gösterilir.",
    "sources": [
      {
        "title": "MedlinePlus: Diabetes Type 2",
        "url": "https://medlineplus.gov/diabetestype2.html",
        "accessedAt": "2026-10-12",
        "sourceDate": "2026-10-10"
      }
    ],
    "educationalParameters": {
      "units": "abstract-0-100",
      "incubationSteps": 0,
      "severity": 55,
      "inflammation": 35,
      "tissueDamage": 30,
      "durationSteps": 14,
      "immuneEvasion": 20,
      "transmissionTendency": 0
    }
  },
  {
    "id": "gout",
    "name": "Gut",
    "category": "metabolic",
    "mechanism": "metabolic",
    "profileType": "real",
    "codePrefix": "D37",
    "description": "Ürat birikimine bağlı inflamatuvar ataklar",
    "initialDiagnosis": "Mekanizma hipotezi; gözlemler değerlendiriliyor",
    "growth": 1,
    "immuneRate": 0,
    "tissueRate": 1.4,
    "affectedSystems": [
      "muscular",
      "renal"
    ],
    "typicalSymptoms": [
      "Eklem ağrısı",
      "Şişlik"
    ],
    "symptomProfile": {
      "muscular": 15,
      "renal": 15
    },
    "immuneResponseType": "Birincil mekanizma metabolik işlevdir",
    "cellularMechanism": "Ürat birikimine bağlı inflamatuvar ataklar",
    "dnaRelation": {
      "kind": "response",
      "explanation": "İnsan DNA dizisi değiştirilmez; hücresel yanıt kavramsal gösterilir.",
      "sourceUrl": "https://medlineplus.gov/gout.html"
    },
    "contagious": false,
    "publicSpreadApplicable": false,
    "spreadModelNote": "Toplum görünümü soyut maruziyet eğilimini gösterir; gerçek bulaşma yolu veya epidemiyolojik tahmin değildir.",
    "educationalTimeline": [
      {
        "phase": "baseline",
        "label": "Başlangıç ve mekanizma",
        "start": 0,
        "end": 2
      },
      {
        "phase": "response",
        "label": "Belirti ve hücresel etki",
        "start": 3,
        "end": 7
      },
      {
        "phase": "observation",
        "label": "İzlem ve karşılaştırma",
        "start": 8,
        "end": 14
      }
    ],
    "timelineDisclaimer": "0–14 eğitim adımı gerçek kuluçka, hastalık süresi veya prognoz tahmini değildir. Kronik hastalıklar hızlandırılmış kavramsal adımlarla gösterilir.",
    "sources": [
      {
        "title": "MedlinePlus: Gout",
        "url": "https://medlineplus.gov/gout.html",
        "accessedAt": "2026-10-12",
        "sourceDate": "2026-10-10"
      }
    ],
    "educationalParameters": {
      "units": "abstract-0-100",
      "incubationSteps": 0,
      "severity": 55,
      "inflammation": 35,
      "tissueDamage": 30,
      "durationSteps": 14,
      "immuneEvasion": 20,
      "transmissionTendency": 0
    }
  },
  {
    "id": "hypothyroidism",
    "name": "Hipotiroidi",
    "category": "metabolic",
    "mechanism": "metabolic",
    "profileType": "real",
    "codePrefix": "D38",
    "description": "Tiroid hormonu yetersizliği",
    "initialDiagnosis": "Mekanizma hipotezi; gözlemler değerlendiriliyor",
    "growth": 1,
    "immuneRate": 0,
    "tissueRate": 1.4,
    "affectedSystems": [
      "metabolic"
    ],
    "typicalSymptoms": [
      "Yorgunluk",
      "Üşüme"
    ],
    "symptomProfile": {
      "metabolic": 15
    },
    "immuneResponseType": "Birincil mekanizma metabolik işlevdir",
    "cellularMechanism": "Tiroid hormonu yetersizliği",
    "dnaRelation": {
      "kind": "response",
      "explanation": "İnsan DNA dizisi değiştirilmez; hücresel yanıt kavramsal gösterilir.",
      "sourceUrl": "https://medlineplus.gov/hypothyroidism.html"
    },
    "contagious": false,
    "publicSpreadApplicable": false,
    "spreadModelNote": "Toplum görünümü soyut maruziyet eğilimini gösterir; gerçek bulaşma yolu veya epidemiyolojik tahmin değildir.",
    "educationalTimeline": [
      {
        "phase": "baseline",
        "label": "Başlangıç ve mekanizma",
        "start": 0,
        "end": 2
      },
      {
        "phase": "response",
        "label": "Belirti ve hücresel etki",
        "start": 3,
        "end": 7
      },
      {
        "phase": "observation",
        "label": "İzlem ve karşılaştırma",
        "start": 8,
        "end": 14
      }
    ],
    "timelineDisclaimer": "0–14 eğitim adımı gerçek kuluçka, hastalık süresi veya prognoz tahmini değildir. Kronik hastalıklar hızlandırılmış kavramsal adımlarla gösterilir.",
    "sources": [
      {
        "title": "MedlinePlus: Hypothyroidism",
        "url": "https://medlineplus.gov/hypothyroidism.html",
        "accessedAt": "2026-10-12",
        "sourceDate": "2026-10-10"
      }
    ],
    "educationalParameters": {
      "units": "abstract-0-100",
      "incubationSteps": 0,
      "severity": 55,
      "inflammation": 35,
      "tissueDamage": 30,
      "durationSteps": 14,
      "immuneEvasion": 20,
      "transmissionTendency": 0
    }
  },
  {
    "id": "hyperthyroidism",
    "name": "Hipertiroidi",
    "category": "metabolic",
    "mechanism": "metabolic",
    "profileType": "real",
    "codePrefix": "D39",
    "description": "Aşırı tiroid hormonu üretimi",
    "initialDiagnosis": "Mekanizma hipotezi; gözlemler değerlendiriliyor",
    "growth": 1,
    "immuneRate": 0,
    "tissueRate": 1.4,
    "affectedSystems": [
      "metabolic",
      "cardiovascular"
    ],
    "typicalSymptoms": [
      "Çarpıntı",
      "Kilo kaybı"
    ],
    "symptomProfile": {
      "metabolic": 15,
      "cardiovascular": 15
    },
    "immuneResponseType": "Birincil mekanizma metabolik işlevdir",
    "cellularMechanism": "Aşırı tiroid hormonu üretimi",
    "dnaRelation": {
      "kind": "response",
      "explanation": "İnsan DNA dizisi değiştirilmez; hücresel yanıt kavramsal gösterilir.",
      "sourceUrl": "https://medlineplus.gov/hyperthyroidism.html"
    },
    "contagious": false,
    "publicSpreadApplicable": false,
    "spreadModelNote": "Toplum görünümü soyut maruziyet eğilimini gösterir; gerçek bulaşma yolu veya epidemiyolojik tahmin değildir.",
    "educationalTimeline": [
      {
        "phase": "baseline",
        "label": "Başlangıç ve mekanizma",
        "start": 0,
        "end": 2
      },
      {
        "phase": "response",
        "label": "Belirti ve hücresel etki",
        "start": 3,
        "end": 7
      },
      {
        "phase": "observation",
        "label": "İzlem ve karşılaştırma",
        "start": 8,
        "end": 14
      }
    ],
    "timelineDisclaimer": "0–14 eğitim adımı gerçek kuluçka, hastalık süresi veya prognoz tahmini değildir. Kronik hastalıklar hızlandırılmış kavramsal adımlarla gösterilir.",
    "sources": [
      {
        "title": "MedlinePlus: Hyperthyroidism",
        "url": "https://medlineplus.gov/hyperthyroidism.html",
        "accessedAt": "2026-10-12",
        "sourceDate": "2026-10-10"
      }
    ],
    "educationalParameters": {
      "units": "abstract-0-100",
      "incubationSteps": 0,
      "severity": 55,
      "inflammation": 35,
      "tissueDamage": 30,
      "durationSteps": 14,
      "immuneEvasion": 20,
      "transmissionTendency": 0
    }
  },
  {
    "id": "alzheimer",
    "name": "Alzheimer hastalığı",
    "category": "neurological",
    "mechanism": "neurological",
    "profileType": "real",
    "codePrefix": "D40",
    "description": "Bellek ve düşünme işlevlerinde ilerleyici bozulma",
    "initialDiagnosis": "Mekanizma hipotezi; gözlemler değerlendiriliyor",
    "growth": 1,
    "immuneRate": 0,
    "tissueRate": 1.4,
    "affectedSystems": [
      "neurological"
    ],
    "typicalSymptoms": [
      "Bellek kaybı",
      "Düşünme güçlüğü"
    ],
    "symptomProfile": {
      "neurological": 15
    },
    "immuneResponseType": "Sinir işlevi etkilenir; immün yanıt hastalığa göre değişir",
    "cellularMechanism": "Bellek ve düşünme işlevlerinde ilerleyici bozulma",
    "dnaRelation": {
      "kind": "response",
      "explanation": "İnsan DNA dizisi değiştirilmez; hücresel yanıt kavramsal gösterilir.",
      "sourceUrl": "https://medlineplus.gov/alzheimersdisease.html"
    },
    "contagious": false,
    "publicSpreadApplicable": false,
    "spreadModelNote": "Toplum görünümü soyut maruziyet eğilimini gösterir; gerçek bulaşma yolu veya epidemiyolojik tahmin değildir.",
    "educationalTimeline": [
      {
        "phase": "baseline",
        "label": "Başlangıç ve mekanizma",
        "start": 0,
        "end": 2
      },
      {
        "phase": "response",
        "label": "Belirti ve hücresel etki",
        "start": 3,
        "end": 7
      },
      {
        "phase": "observation",
        "label": "İzlem ve karşılaştırma",
        "start": 8,
        "end": 14
      }
    ],
    "timelineDisclaimer": "0–14 eğitim adımı gerçek kuluçka, hastalık süresi veya prognoz tahmini değildir. Kronik hastalıklar hızlandırılmış kavramsal adımlarla gösterilir.",
    "sources": [
      {
        "title": "MedlinePlus: Alzheimer's Disease",
        "url": "https://medlineplus.gov/alzheimersdisease.html",
        "accessedAt": "2026-10-12",
        "sourceDate": "2026-10-10"
      }
    ],
    "educationalParameters": {
      "units": "abstract-0-100",
      "incubationSteps": 0,
      "severity": 55,
      "inflammation": 35,
      "tissueDamage": 30,
      "durationSteps": 14,
      "immuneEvasion": 20,
      "transmissionTendency": 0
    }
  },
  {
    "id": "parkinson",
    "name": "Parkinson hastalığı",
    "category": "neurological",
    "mechanism": "neurological",
    "profileType": "real",
    "codePrefix": "D41",
    "description": "Dopamin yetersizliğiyle ilişkili hareket kontrolü bozukluğu",
    "initialDiagnosis": "Mekanizma hipotezi; gözlemler değerlendiriliyor",
    "growth": 1,
    "immuneRate": 0,
    "tissueRate": 1.4,
    "affectedSystems": [
      "neurological",
      "muscular"
    ],
    "typicalSymptoms": [
      "Titreme",
      "Hareket yavaşlığı"
    ],
    "symptomProfile": {
      "neurological": 15,
      "muscular": 15
    },
    "immuneResponseType": "Sinir işlevi etkilenir; immün yanıt hastalığa göre değişir",
    "cellularMechanism": "Dopamin yetersizliğiyle ilişkili hareket kontrolü bozukluğu",
    "dnaRelation": {
      "kind": "response",
      "explanation": "İnsan DNA dizisi değiştirilmez; hücresel yanıt kavramsal gösterilir.",
      "sourceUrl": "https://medlineplus.gov/parkinsonsdisease.html"
    },
    "contagious": false,
    "publicSpreadApplicable": false,
    "spreadModelNote": "Toplum görünümü soyut maruziyet eğilimini gösterir; gerçek bulaşma yolu veya epidemiyolojik tahmin değildir.",
    "educationalTimeline": [
      {
        "phase": "baseline",
        "label": "Başlangıç ve mekanizma",
        "start": 0,
        "end": 2
      },
      {
        "phase": "response",
        "label": "Belirti ve hücresel etki",
        "start": 3,
        "end": 7
      },
      {
        "phase": "observation",
        "label": "İzlem ve karşılaştırma",
        "start": 8,
        "end": 14
      }
    ],
    "timelineDisclaimer": "0–14 eğitim adımı gerçek kuluçka, hastalık süresi veya prognoz tahmini değildir. Kronik hastalıklar hızlandırılmış kavramsal adımlarla gösterilir.",
    "sources": [
      {
        "title": "MedlinePlus: Parkinson's Disease",
        "url": "https://medlineplus.gov/parkinsonsdisease.html",
        "accessedAt": "2026-10-12",
        "sourceDate": "2026-10-10"
      }
    ],
    "educationalParameters": {
      "units": "abstract-0-100",
      "incubationSteps": 0,
      "severity": 55,
      "inflammation": 35,
      "tissueDamage": 30,
      "durationSteps": 14,
      "immuneEvasion": 20,
      "transmissionTendency": 0
    }
  },
  {
    "id": "epilepsy",
    "name": "Epilepsi",
    "category": "neurological",
    "mechanism": "neurological",
    "profileType": "real",
    "codePrefix": "D42",
    "description": "Nöronların uygunsuz sinyal etkinliği",
    "initialDiagnosis": "Mekanizma hipotezi; gözlemler değerlendiriliyor",
    "growth": 1,
    "immuneRate": 0,
    "tissueRate": 1.4,
    "affectedSystems": [
      "neurological"
    ],
    "typicalSymptoms": [
      "Tekrarlayan nöbetler"
    ],
    "symptomProfile": {
      "neurological": 15
    },
    "immuneResponseType": "Sinir işlevi etkilenir; immün yanıt hastalığa göre değişir",
    "cellularMechanism": "Nöronların uygunsuz sinyal etkinliği",
    "dnaRelation": {
      "kind": "response",
      "explanation": "İnsan DNA dizisi değiştirilmez; hücresel yanıt kavramsal gösterilir.",
      "sourceUrl": "https://medlineplus.gov/epilepsy.html"
    },
    "contagious": false,
    "publicSpreadApplicable": false,
    "spreadModelNote": "Toplum görünümü soyut maruziyet eğilimini gösterir; gerçek bulaşma yolu veya epidemiyolojik tahmin değildir.",
    "educationalTimeline": [
      {
        "phase": "baseline",
        "label": "Başlangıç ve mekanizma",
        "start": 0,
        "end": 2
      },
      {
        "phase": "response",
        "label": "Belirti ve hücresel etki",
        "start": 3,
        "end": 7
      },
      {
        "phase": "observation",
        "label": "İzlem ve karşılaştırma",
        "start": 8,
        "end": 14
      }
    ],
    "timelineDisclaimer": "0–14 eğitim adımı gerçek kuluçka, hastalık süresi veya prognoz tahmini değildir. Kronik hastalıklar hızlandırılmış kavramsal adımlarla gösterilir.",
    "sources": [
      {
        "title": "MedlinePlus: Epilepsy",
        "url": "https://medlineplus.gov/epilepsy.html",
        "accessedAt": "2026-10-12",
        "sourceDate": "2026-10-10"
      }
    ],
    "educationalParameters": {
      "units": "abstract-0-100",
      "incubationSteps": 0,
      "severity": 55,
      "inflammation": 35,
      "tissueDamage": 30,
      "durationSteps": 14,
      "immuneEvasion": 20,
      "transmissionTendency": 0
    }
  },
  {
    "id": "als",
    "name": "Amyotrofik lateral skleroz",
    "category": "neurological",
    "mechanism": "neurological",
    "profileType": "real",
    "codePrefix": "D43",
    "description": "Motor nöron kaybı istemli kasların kontrolünü bozar",
    "initialDiagnosis": "Mekanizma hipotezi; gözlemler değerlendiriliyor",
    "growth": 1,
    "immuneRate": 0,
    "tissueRate": 1.4,
    "affectedSystems": [
      "neurological",
      "muscular",
      "respiratory"
    ],
    "typicalSymptoms": [
      "Kas güçsüzlüğü",
      "Konuşma güçlüğü"
    ],
    "symptomProfile": {
      "neurological": 15,
      "muscular": 15,
      "respiratory": 15
    },
    "immuneResponseType": "Sinir işlevi etkilenir; immün yanıt hastalığa göre değişir",
    "cellularMechanism": "Motor nöron kaybı istemli kasların kontrolünü bozar",
    "dnaRelation": {
      "kind": "response",
      "explanation": "İnsan DNA dizisi değiştirilmez; hücresel yanıt kavramsal gösterilir.",
      "sourceUrl": "https://medlineplus.gov/amyotrophiclateralsclerosis.html"
    },
    "contagious": false,
    "publicSpreadApplicable": false,
    "spreadModelNote": "Toplum görünümü soyut maruziyet eğilimini gösterir; gerçek bulaşma yolu veya epidemiyolojik tahmin değildir.",
    "educationalTimeline": [
      {
        "phase": "baseline",
        "label": "Başlangıç ve mekanizma",
        "start": 0,
        "end": 2
      },
      {
        "phase": "response",
        "label": "Belirti ve hücresel etki",
        "start": 3,
        "end": 7
      },
      {
        "phase": "observation",
        "label": "İzlem ve karşılaştırma",
        "start": 8,
        "end": 14
      }
    ],
    "timelineDisclaimer": "0–14 eğitim adımı gerçek kuluçka, hastalık süresi veya prognoz tahmini değildir. Kronik hastalıklar hızlandırılmış kavramsal adımlarla gösterilir.",
    "sources": [
      {
        "title": "MedlinePlus: Amyotrophic Lateral Sclerosis",
        "url": "https://medlineplus.gov/amyotrophiclateralsclerosis.html",
        "accessedAt": "2026-10-12",
        "sourceDate": "2026-10-10"
      }
    ],
    "educationalParameters": {
      "units": "abstract-0-100",
      "incubationSteps": 0,
      "severity": 55,
      "inflammation": 35,
      "tissueDamage": 30,
      "durationSteps": 14,
      "immuneEvasion": 20,
      "transmissionTendency": 0
    }
  },
  {
    "id": "migraine",
    "name": "Migren",
    "category": "neurological",
    "mechanism": "neurological",
    "profileType": "real",
    "codePrefix": "D44",
    "description": "Tekrarlayan baş ağrısı ve duyusal hassasiyet",
    "initialDiagnosis": "Mekanizma hipotezi; gözlemler değerlendiriliyor",
    "growth": 1,
    "immuneRate": 0,
    "tissueRate": 1.4,
    "affectedSystems": [
      "neurological"
    ],
    "typicalSymptoms": [
      "Zonklayan baş ağrısı",
      "Işık hassasiyeti"
    ],
    "symptomProfile": {
      "neurological": 15
    },
    "immuneResponseType": "Sinir işlevi etkilenir; immün yanıt hastalığa göre değişir",
    "cellularMechanism": "Tekrarlayan baş ağrısı ve duyusal hassasiyet",
    "dnaRelation": {
      "kind": "response",
      "explanation": "İnsan DNA dizisi değiştirilmez; hücresel yanıt kavramsal gösterilir.",
      "sourceUrl": "https://medlineplus.gov/migraine.html"
    },
    "contagious": false,
    "publicSpreadApplicable": false,
    "spreadModelNote": "Toplum görünümü soyut maruziyet eğilimini gösterir; gerçek bulaşma yolu veya epidemiyolojik tahmin değildir.",
    "educationalTimeline": [
      {
        "phase": "baseline",
        "label": "Başlangıç ve mekanizma",
        "start": 0,
        "end": 2
      },
      {
        "phase": "response",
        "label": "Belirti ve hücresel etki",
        "start": 3,
        "end": 7
      },
      {
        "phase": "observation",
        "label": "İzlem ve karşılaştırma",
        "start": 8,
        "end": 14
      }
    ],
    "timelineDisclaimer": "0–14 eğitim adımı gerçek kuluçka, hastalık süresi veya prognoz tahmini değildir. Kronik hastalıklar hızlandırılmış kavramsal adımlarla gösterilir.",
    "sources": [
      {
        "title": "MedlinePlus: Migraine",
        "url": "https://medlineplus.gov/migraine.html",
        "accessedAt": "2026-10-12",
        "sourceDate": "2026-10-10"
      }
    ],
    "educationalParameters": {
      "units": "abstract-0-100",
      "incubationSteps": 0,
      "severity": 55,
      "inflammation": 35,
      "tissueDamage": 30,
      "durationSteps": 14,
      "immuneEvasion": 20,
      "transmissionTendency": 0
    }
  },
  {
    "id": "breast-cancer",
    "name": "Meme kanseri",
    "category": "oncology",
    "mechanism": "oncology",
    "profileType": "real",
    "codePrefix": "D45",
    "description": "Meme dokusunda kontrolsüz hücre çoğalması",
    "initialDiagnosis": "Mekanizma hipotezi; gözlemler değerlendiriliyor",
    "growth": 1,
    "immuneRate": 0,
    "tissueRate": 1.4,
    "affectedSystems": [
      "reproductive",
      "systemic"
    ],
    "typicalSymptoms": [
      "Memede kitle"
    ],
    "symptomProfile": {
      "reproductive": 15,
      "systemic": 15
    },
    "immuneResponseType": "Anormal hücreler ve doku mikroçevresi ilişkisi",
    "cellularMechanism": "Meme dokusunda kontrolsüz hücre çoğalması",
    "dnaRelation": {
      "kind": "somatic",
      "explanation": "Hücre çoğalmasının genetik düzenlenmesi kavramsal incelenir; gerçek mutasyon hedefi uygulanmaz.",
      "sourceUrl": "https://medlineplus.gov/breastcancer.html"
    },
    "contagious": false,
    "publicSpreadApplicable": false,
    "spreadModelNote": "Toplum görünümü soyut maruziyet eğilimini gösterir; gerçek bulaşma yolu veya epidemiyolojik tahmin değildir.",
    "educationalTimeline": [
      {
        "phase": "baseline",
        "label": "Başlangıç ve mekanizma",
        "start": 0,
        "end": 2
      },
      {
        "phase": "response",
        "label": "Belirti ve hücresel etki",
        "start": 3,
        "end": 7
      },
      {
        "phase": "observation",
        "label": "İzlem ve karşılaştırma",
        "start": 8,
        "end": 14
      }
    ],
    "timelineDisclaimer": "0–14 eğitim adımı gerçek kuluçka, hastalık süresi veya prognoz tahmini değildir. Kronik hastalıklar hızlandırılmış kavramsal adımlarla gösterilir.",
    "sources": [
      {
        "title": "MedlinePlus: Breast Cancer",
        "url": "https://medlineplus.gov/breastcancer.html",
        "accessedAt": "2026-10-12",
        "sourceDate": "2026-10-10"
      }
    ],
    "educationalParameters": {
      "units": "abstract-0-100",
      "incubationSteps": 0,
      "severity": 55,
      "inflammation": 35,
      "tissueDamage": 30,
      "durationSteps": 14,
      "immuneEvasion": 45,
      "transmissionTendency": 0
    }
  },
  {
    "id": "lung-cancer",
    "name": "Akciğer kanseri",
    "category": "oncology",
    "mechanism": "oncology",
    "profileType": "real",
    "codePrefix": "D46",
    "description": "Akciğer hücrelerinde kontrolsüz çoğalma",
    "initialDiagnosis": "Mekanizma hipotezi; gözlemler değerlendiriliyor",
    "growth": 1,
    "immuneRate": 0,
    "tissueRate": 1.4,
    "affectedSystems": [
      "respiratory"
    ],
    "typicalSymptoms": [
      "Öksürük",
      "Solunum güçlüğü"
    ],
    "symptomProfile": {
      "respiratory": 15
    },
    "immuneResponseType": "Anormal hücreler ve doku mikroçevresi ilişkisi",
    "cellularMechanism": "Akciğer hücrelerinde kontrolsüz çoğalma",
    "dnaRelation": {
      "kind": "somatic",
      "explanation": "Hücre çoğalmasının genetik düzenlenmesi kavramsal incelenir; gerçek mutasyon hedefi uygulanmaz.",
      "sourceUrl": "https://medlineplus.gov/lungcancer.html"
    },
    "contagious": false,
    "publicSpreadApplicable": false,
    "spreadModelNote": "Toplum görünümü soyut maruziyet eğilimini gösterir; gerçek bulaşma yolu veya epidemiyolojik tahmin değildir.",
    "educationalTimeline": [
      {
        "phase": "baseline",
        "label": "Başlangıç ve mekanizma",
        "start": 0,
        "end": 2
      },
      {
        "phase": "response",
        "label": "Belirti ve hücresel etki",
        "start": 3,
        "end": 7
      },
      {
        "phase": "observation",
        "label": "İzlem ve karşılaştırma",
        "start": 8,
        "end": 14
      }
    ],
    "timelineDisclaimer": "0–14 eğitim adımı gerçek kuluçka, hastalık süresi veya prognoz tahmini değildir. Kronik hastalıklar hızlandırılmış kavramsal adımlarla gösterilir.",
    "sources": [
      {
        "title": "MedlinePlus: Lung Cancer",
        "url": "https://medlineplus.gov/lungcancer.html",
        "accessedAt": "2026-10-12",
        "sourceDate": "2026-10-10"
      }
    ],
    "educationalParameters": {
      "units": "abstract-0-100",
      "incubationSteps": 0,
      "severity": 55,
      "inflammation": 35,
      "tissueDamage": 30,
      "durationSteps": 14,
      "immuneEvasion": 45,
      "transmissionTendency": 0
    }
  },
  {
    "id": "colorectal-cancer",
    "name": "Kolorektal kanser",
    "category": "oncology",
    "mechanism": "oncology",
    "profileType": "real",
    "codePrefix": "D47",
    "description": "DNA değişiklikleriyle ilişkili kolon veya rektum hücrelerinin çoğalması",
    "initialDiagnosis": "Mekanizma hipotezi; gözlemler değerlendiriliyor",
    "growth": 1,
    "immuneRate": 0,
    "tissueRate": 1.4,
    "affectedSystems": [
      "digestive"
    ],
    "typicalSymptoms": [
      "Dışkıda kan",
      "Bağırsak alışkanlığı değişimi"
    ],
    "symptomProfile": {
      "digestive": 15
    },
    "immuneResponseType": "Anormal hücreler ve doku mikroçevresi ilişkisi",
    "cellularMechanism": "DNA değişiklikleriyle ilişkili kolon veya rektum hücrelerinin çoğalması",
    "dnaRelation": {
      "kind": "somatic",
      "explanation": "Hücre çoğalmasının genetik düzenlenmesi kavramsal incelenir; gerçek mutasyon hedefi uygulanmaz.",
      "sourceUrl": "https://medlineplus.gov/colorectalcancer.html"
    },
    "contagious": false,
    "publicSpreadApplicable": false,
    "spreadModelNote": "Toplum görünümü soyut maruziyet eğilimini gösterir; gerçek bulaşma yolu veya epidemiyolojik tahmin değildir.",
    "educationalTimeline": [
      {
        "phase": "baseline",
        "label": "Başlangıç ve mekanizma",
        "start": 0,
        "end": 2
      },
      {
        "phase": "response",
        "label": "Belirti ve hücresel etki",
        "start": 3,
        "end": 7
      },
      {
        "phase": "observation",
        "label": "İzlem ve karşılaştırma",
        "start": 8,
        "end": 14
      }
    ],
    "timelineDisclaimer": "0–14 eğitim adımı gerçek kuluçka, hastalık süresi veya prognoz tahmini değildir. Kronik hastalıklar hızlandırılmış kavramsal adımlarla gösterilir.",
    "sources": [
      {
        "title": "MedlinePlus: Colorectal Cancer",
        "url": "https://medlineplus.gov/colorectalcancer.html",
        "accessedAt": "2026-10-12",
        "sourceDate": "2026-10-10"
      }
    ],
    "educationalParameters": {
      "units": "abstract-0-100",
      "incubationSteps": 0,
      "severity": 55,
      "inflammation": 35,
      "tissueDamage": 30,
      "durationSteps": 14,
      "immuneEvasion": 45,
      "transmissionTendency": 0
    }
  },
  {
    "id": "prostate-cancer",
    "name": "Prostat kanseri",
    "category": "oncology",
    "mechanism": "oncology",
    "profileType": "real",
    "codePrefix": "D48",
    "description": "DNA değişiklikleriyle ilişkili prostat hücrelerinin çoğalması",
    "initialDiagnosis": "Mekanizma hipotezi; gözlemler değerlendiriliyor",
    "growth": 1,
    "immuneRate": 0,
    "tissueRate": 1.4,
    "affectedSystems": [
      "reproductive"
    ],
    "typicalSymptoms": [
      "İdrar yapmada güçlük",
      "Belirtisiz seyir"
    ],
    "symptomProfile": {
      "reproductive": 15
    },
    "immuneResponseType": "Anormal hücreler ve doku mikroçevresi ilişkisi",
    "cellularMechanism": "DNA değişiklikleriyle ilişkili prostat hücrelerinin çoğalması",
    "dnaRelation": {
      "kind": "somatic",
      "explanation": "Hücre çoğalmasının genetik düzenlenmesi kavramsal incelenir; gerçek mutasyon hedefi uygulanmaz.",
      "sourceUrl": "https://medlineplus.gov/prostatecancer.html"
    },
    "contagious": false,
    "publicSpreadApplicable": false,
    "spreadModelNote": "Toplum görünümü soyut maruziyet eğilimini gösterir; gerçek bulaşma yolu veya epidemiyolojik tahmin değildir.",
    "educationalTimeline": [
      {
        "phase": "baseline",
        "label": "Başlangıç ve mekanizma",
        "start": 0,
        "end": 2
      },
      {
        "phase": "response",
        "label": "Belirti ve hücresel etki",
        "start": 3,
        "end": 7
      },
      {
        "phase": "observation",
        "label": "İzlem ve karşılaştırma",
        "start": 8,
        "end": 14
      }
    ],
    "timelineDisclaimer": "0–14 eğitim adımı gerçek kuluçka, hastalık süresi veya prognoz tahmini değildir. Kronik hastalıklar hızlandırılmış kavramsal adımlarla gösterilir.",
    "sources": [
      {
        "title": "MedlinePlus: Prostate Cancer",
        "url": "https://medlineplus.gov/prostatecancer.html",
        "accessedAt": "2026-10-12",
        "sourceDate": "2026-10-10"
      }
    ],
    "educationalParameters": {
      "units": "abstract-0-100",
      "incubationSteps": 0,
      "severity": 55,
      "inflammation": 35,
      "tissueDamage": 30,
      "durationSteps": 14,
      "immuneEvasion": 45,
      "transmissionTendency": 0
    }
  },
  {
    "id": "leukemia",
    "name": "Lösemi",
    "category": "oncology",
    "mechanism": "oncology",
    "profileType": "real",
    "codePrefix": "D49",
    "description": "Kan yapıcı dokularda anormal hücre çoğalması",
    "initialDiagnosis": "Mekanizma hipotezi; gözlemler değerlendiriliyor",
    "growth": 1,
    "immuneRate": 0,
    "tissueRate": 1.4,
    "affectedSystems": [
      "systemic"
    ],
    "typicalSymptoms": [
      "Yorgunluk",
      "Kolay kanama"
    ],
    "symptomProfile": {
      "systemic": 15
    },
    "immuneResponseType": "Anormal hücreler ve doku mikroçevresi ilişkisi",
    "cellularMechanism": "Kan yapıcı dokularda anormal hücre çoğalması",
    "dnaRelation": {
      "kind": "somatic",
      "explanation": "Hücre çoğalmasının genetik düzenlenmesi kavramsal incelenir; gerçek mutasyon hedefi uygulanmaz.",
      "sourceUrl": "https://medlineplus.gov/leukemia.html"
    },
    "contagious": false,
    "publicSpreadApplicable": false,
    "spreadModelNote": "Toplum görünümü soyut maruziyet eğilimini gösterir; gerçek bulaşma yolu veya epidemiyolojik tahmin değildir.",
    "educationalTimeline": [
      {
        "phase": "baseline",
        "label": "Başlangıç ve mekanizma",
        "start": 0,
        "end": 2
      },
      {
        "phase": "response",
        "label": "Belirti ve hücresel etki",
        "start": 3,
        "end": 7
      },
      {
        "phase": "observation",
        "label": "İzlem ve karşılaştırma",
        "start": 8,
        "end": 14
      }
    ],
    "timelineDisclaimer": "0–14 eğitim adımı gerçek kuluçka, hastalık süresi veya prognoz tahmini değildir. Kronik hastalıklar hızlandırılmış kavramsal adımlarla gösterilir.",
    "sources": [
      {
        "title": "MedlinePlus: Leukemia",
        "url": "https://medlineplus.gov/leukemia.html",
        "accessedAt": "2026-10-12",
        "sourceDate": "2026-10-10"
      }
    ],
    "educationalParameters": {
      "units": "abstract-0-100",
      "incubationSteps": 0,
      "severity": 55,
      "inflammation": 35,
      "tissueDamage": 30,
      "durationSteps": 14,
      "immuneEvasion": 45,
      "transmissionTendency": 0
    }
  },
  {
    "id": "lymphoma",
    "name": "Lenfoma",
    "category": "oncology",
    "mechanism": "oncology",
    "profileType": "real",
    "codePrefix": "D50",
    "description": "Lenf sisteminde anormal lenfosit çoğalması",
    "initialDiagnosis": "Mekanizma hipotezi; gözlemler değerlendiriliyor",
    "growth": 1,
    "immuneRate": 0,
    "tissueRate": 1.4,
    "affectedSystems": [
      "systemic"
    ],
    "typicalSymptoms": [
      "Lenf bezi şişliği",
      "Gece terlemesi"
    ],
    "symptomProfile": {
      "systemic": 15
    },
    "immuneResponseType": "Anormal hücreler ve doku mikroçevresi ilişkisi",
    "cellularMechanism": "Lenf sisteminde anormal lenfosit çoğalması",
    "dnaRelation": {
      "kind": "somatic",
      "explanation": "Hücre çoğalmasının genetik düzenlenmesi kavramsal incelenir; gerçek mutasyon hedefi uygulanmaz.",
      "sourceUrl": "https://medlineplus.gov/lymphoma.html"
    },
    "contagious": false,
    "publicSpreadApplicable": false,
    "spreadModelNote": "Toplum görünümü soyut maruziyet eğilimini gösterir; gerçek bulaşma yolu veya epidemiyolojik tahmin değildir.",
    "educationalTimeline": [
      {
        "phase": "baseline",
        "label": "Başlangıç ve mekanizma",
        "start": 0,
        "end": 2
      },
      {
        "phase": "response",
        "label": "Belirti ve hücresel etki",
        "start": 3,
        "end": 7
      },
      {
        "phase": "observation",
        "label": "İzlem ve karşılaştırma",
        "start": 8,
        "end": 14
      }
    ],
    "timelineDisclaimer": "0–14 eğitim adımı gerçek kuluçka, hastalık süresi veya prognoz tahmini değildir. Kronik hastalıklar hızlandırılmış kavramsal adımlarla gösterilir.",
    "sources": [
      {
        "title": "MedlinePlus: Lymphoma",
        "url": "https://medlineplus.gov/lymphoma.html",
        "accessedAt": "2026-10-12",
        "sourceDate": "2026-10-10"
      }
    ],
    "educationalParameters": {
      "units": "abstract-0-100",
      "incubationSteps": 0,
      "severity": 55,
      "inflammation": 35,
      "tissueDamage": 30,
      "durationSteps": 14,
      "immuneEvasion": 45,
      "transmissionTendency": 0
    }
  },
  {
    "id": "melanoma",
    "name": "Melanom",
    "category": "oncology",
    "mechanism": "oncology",
    "profileType": "real",
    "codePrefix": "D51",
    "description": "Deride değişen pigmentli lezyonlarla kendini gösterebilen kanser",
    "initialDiagnosis": "Mekanizma hipotezi; gözlemler değerlendiriliyor",
    "growth": 1,
    "immuneRate": 0,
    "tissueRate": 1.4,
    "affectedSystems": [
      "skin"
    ],
    "typicalSymptoms": [
      "Bende renk değişimi",
      "Biçim değişimi"
    ],
    "symptomProfile": {
      "skin": 15
    },
    "immuneResponseType": "Anormal hücreler ve doku mikroçevresi ilişkisi",
    "cellularMechanism": "Deride değişen pigmentli lezyonlarla kendini gösterebilen kanser",
    "dnaRelation": {
      "kind": "somatic",
      "explanation": "Hücre çoğalmasının genetik düzenlenmesi kavramsal incelenir; gerçek mutasyon hedefi uygulanmaz.",
      "sourceUrl": "https://medlineplus.gov/melanoma.html"
    },
    "contagious": false,
    "publicSpreadApplicable": false,
    "spreadModelNote": "Toplum görünümü soyut maruziyet eğilimini gösterir; gerçek bulaşma yolu veya epidemiyolojik tahmin değildir.",
    "educationalTimeline": [
      {
        "phase": "baseline",
        "label": "Başlangıç ve mekanizma",
        "start": 0,
        "end": 2
      },
      {
        "phase": "response",
        "label": "Belirti ve hücresel etki",
        "start": 3,
        "end": 7
      },
      {
        "phase": "observation",
        "label": "İzlem ve karşılaştırma",
        "start": 8,
        "end": 14
      }
    ],
    "timelineDisclaimer": "0–14 eğitim adımı gerçek kuluçka, hastalık süresi veya prognoz tahmini değildir. Kronik hastalıklar hızlandırılmış kavramsal adımlarla gösterilir.",
    "sources": [
      {
        "title": "MedlinePlus: Melanoma",
        "url": "https://medlineplus.gov/melanoma.html",
        "accessedAt": "2026-10-12",
        "sourceDate": "2026-10-10"
      }
    ],
    "educationalParameters": {
      "units": "abstract-0-100",
      "incubationSteps": 0,
      "severity": 55,
      "inflammation": 35,
      "tissueDamage": 30,
      "durationSteps": 14,
      "immuneEvasion": 45,
      "transmissionTendency": 0
    }
  },
  {
    "id": "pancreatic-cancer",
    "name": "Pankreas kanseri",
    "category": "oncology",
    "mechanism": "oncology",
    "profileType": "real",
    "codePrefix": "D52",
    "description": "Pankreasta çoğunlukla sindirim salgısı üreten hücrelerden başlayan kanser",
    "initialDiagnosis": "Mekanizma hipotezi; gözlemler değerlendiriliyor",
    "growth": 1,
    "immuneRate": 0,
    "tissueRate": 1.4,
    "affectedSystems": [
      "digestive",
      "metabolic"
    ],
    "typicalSymptoms": [
      "Sarılık",
      "Karın ağrısı"
    ],
    "symptomProfile": {
      "digestive": 15,
      "metabolic": 15
    },
    "immuneResponseType": "Anormal hücreler ve doku mikroçevresi ilişkisi",
    "cellularMechanism": "Pankreasta çoğunlukla sindirim salgısı üreten hücrelerden başlayan kanser",
    "dnaRelation": {
      "kind": "somatic",
      "explanation": "Hücre çoğalmasının genetik düzenlenmesi kavramsal incelenir; gerçek mutasyon hedefi uygulanmaz.",
      "sourceUrl": "https://medlineplus.gov/pancreaticcancer.html"
    },
    "contagious": false,
    "publicSpreadApplicable": false,
    "spreadModelNote": "Toplum görünümü soyut maruziyet eğilimini gösterir; gerçek bulaşma yolu veya epidemiyolojik tahmin değildir.",
    "educationalTimeline": [
      {
        "phase": "baseline",
        "label": "Başlangıç ve mekanizma",
        "start": 0,
        "end": 2
      },
      {
        "phase": "response",
        "label": "Belirti ve hücresel etki",
        "start": 3,
        "end": 7
      },
      {
        "phase": "observation",
        "label": "İzlem ve karşılaştırma",
        "start": 8,
        "end": 14
      }
    ],
    "timelineDisclaimer": "0–14 eğitim adımı gerçek kuluçka, hastalık süresi veya prognoz tahmini değildir. Kronik hastalıklar hızlandırılmış kavramsal adımlarla gösterilir.",
    "sources": [
      {
        "title": "MedlinePlus: Pancreatic Cancer",
        "url": "https://medlineplus.gov/pancreaticcancer.html",
        "accessedAt": "2026-10-12",
        "sourceDate": "2026-10-10"
      }
    ],
    "educationalParameters": {
      "units": "abstract-0-100",
      "incubationSteps": 0,
      "severity": 55,
      "inflammation": 35,
      "tissueDamage": 30,
      "durationSteps": 14,
      "immuneEvasion": 45,
      "transmissionTendency": 0
    }
  }
];
const RAW_LEGACY_SCENARIOS = [
  {
    "id": "bacterial",
    "name": "Bakteriyel enfeksiyon",
    "category": "bacterial",
    "codePrefix": "BAC",
    "description": "Bakteriyel yük ve doğal bağışıklık yanıtı.",
    "initialDiagnosis": "Bakteriyel enfeksiyon olasılığı",
    "growth": 1.25,
    "immuneRate": 0.9,
    "profileType": "legacy-educational",
    "mechanism": "infectious/bacterial",
    "typicalSymptoms": [
      "Soyut organ yanıtı"
    ],
    "immuneResponseType": "Doğal ve edinilmiş antibakteriyel yanıt",
    "cellularMechanism": "Bakteriyel yük ve doğal bağışıklık yanıtı.",
    "educationalTimeline": [
      {
        "phase": "baseline",
        "label": "Başlangıç ve mekanizma",
        "start": 0,
        "end": 2
      },
      {
        "phase": "response",
        "label": "Belirti ve hücresel etki",
        "start": 3,
        "end": 7
      },
      {
        "phase": "observation",
        "label": "İzlem ve karşılaştırma",
        "start": 8,
        "end": 14
      }
    ],
    "timelineDisclaimer": "0–14 eğitim adımı gerçek kuluçka, hastalık süresi veya prognoz tahmini değildir. Kronik hastalıklar hızlandırılmış kavramsal adımlarla gösterilir.",
    "sources": [
      {
        "title": "MedlinePlus: Infections",
        "url": "https://medlineplus.gov/infections.html",
        "accessedAt": "2026-10-12"
      }
    ]
  },
  {
    "id": "mixed",
    "name": "Ko-enfeksiyon şüphesi",
    "category": "mixed",
    "codePrefix": "MIX",
    "description": "Birlikte gelişen etkenlerin soyut karşılaştırması.",
    "initialDiagnosis": "Karma enfeksiyon olasılığı",
    "growth": 1.31,
    "immuneRate": 0.85,
    "profileType": "legacy-educational",
    "mechanism": "infectious/mixed",
    "typicalSymptoms": [
      "Soyut organ yanıtı"
    ],
    "immuneResponseType": "Birden çok etken için soyut immün yanıt",
    "cellularMechanism": "Birlikte gelişen etkenlerin soyut karşılaştırması.",
    "educationalTimeline": [
      {
        "phase": "baseline",
        "label": "Başlangıç ve mekanizma",
        "start": 0,
        "end": 2
      },
      {
        "phase": "response",
        "label": "Belirti ve hücresel etki",
        "start": 3,
        "end": 7
      },
      {
        "phase": "observation",
        "label": "İzlem ve karşılaştırma",
        "start": 8,
        "end": 14
      }
    ],
    "timelineDisclaimer": "0–14 eğitim adımı gerçek kuluçka, hastalık süresi veya prognoz tahmini değildir. Kronik hastalıklar hızlandırılmış kavramsal adımlarla gösterilir.",
    "sources": [
      {
        "title": "MedlinePlus: Infections",
        "url": "https://medlineplus.gov/infections.html",
        "accessedAt": "2026-10-12"
      }
    ]
  },
  {
    "id": "covid-like",
    "name": "COVID-benzeri solunum yolu enfeksiyonu",
    "category": "viral",
    "codePrefix": "COV",
    "description": "Bakteriyel yük ve doğal bağışıklık yanıtı.",
    "initialDiagnosis": "Bakteriyel enfeksiyon olasılığı",
    "growth": 1.25,
    "immuneRate": 0.98,
    "profileType": "legacy-educational",
    "mechanism": "infectious/viral",
    "typicalSymptoms": [
      "Soyut organ yanıtı"
    ],
    "immuneResponseType": "Doğal ve edinilmiş antibakteriyel yanıt",
    "cellularMechanism": "Bakteriyel yük ve doğal bağışıklık yanıtı.",
    "educationalTimeline": [
      {
        "phase": "baseline",
        "label": "Başlangıç ve mekanizma",
        "start": 0,
        "end": 2
      },
      {
        "phase": "response",
        "label": "Belirti ve hücresel etki",
        "start": 3,
        "end": 7
      },
      {
        "phase": "observation",
        "label": "İzlem ve karşılaştırma",
        "start": 8,
        "end": 14
      }
    ],
    "timelineDisclaimer": "0–14 eğitim adımı gerçek kuluçka, hastalık süresi veya prognoz tahmini değildir. Kronik hastalıklar hızlandırılmış kavramsal adımlarla gösterilir.",
    "sources": [
      {
        "title": "MedlinePlus: Infections",
        "url": "https://medlineplus.gov/infections.html",
        "accessedAt": "2026-10-12"
      }
    ],
    "affectedSystems": [
      "respiratory",
      "systemic"
    ],
    "symptomProfile": {
      "respiratory": 17,
      "systemic": 18
    },
    "contagious": true,
    "publicSpreadApplicable": true
  },
  {
    "id": "gastroenteritis",
    "name": "Gastroenterit / norovirüs benzeri",
    "category": "viral",
    "codePrefix": "GAS",
    "description": "Bakteriyel yük ve doğal bağışıklık yanıtı.",
    "initialDiagnosis": "Bakteriyel enfeksiyon olasılığı",
    "growth": 1.16,
    "immuneRate": 1.18,
    "profileType": "legacy-educational",
    "mechanism": "infectious/viral",
    "typicalSymptoms": [
      "Soyut organ yanıtı"
    ],
    "immuneResponseType": "Doğal ve edinilmiş antibakteriyel yanıt",
    "cellularMechanism": "Bakteriyel yük ve doğal bağışıklık yanıtı.",
    "educationalTimeline": [
      {
        "phase": "baseline",
        "label": "Başlangıç ve mekanizma",
        "start": 0,
        "end": 2
      },
      {
        "phase": "response",
        "label": "Belirti ve hücresel etki",
        "start": 3,
        "end": 7
      },
      {
        "phase": "observation",
        "label": "İzlem ve karşılaştırma",
        "start": 8,
        "end": 14
      }
    ],
    "timelineDisclaimer": "0–14 eğitim adımı gerçek kuluçka, hastalık süresi veya prognoz tahmini değildir. Kronik hastalıklar hızlandırılmış kavramsal adımlarla gösterilir.",
    "sources": [
      {
        "title": "MedlinePlus: Infections",
        "url": "https://medlineplus.gov/infections.html",
        "accessedAt": "2026-10-12"
      }
    ],
    "affectedSystems": [
      "digestive"
    ],
    "symptomProfile": {
      "digestive": 17
    },
    "contagious": true,
    "publicSpreadApplicable": true
  },
  {
    "id": "avian-flu-like",
    "name": "Kuş gribi benzeri senaryo",
    "category": "viral",
    "codePrefix": "AVI",
    "description": "Bakteriyel yük ve doğal bağışıklık yanıtı.",
    "initialDiagnosis": "Bakteriyel enfeksiyon olasılığı",
    "growth": 1.32,
    "immuneRate": 0.88,
    "profileType": "legacy-educational",
    "mechanism": "infectious/viral",
    "typicalSymptoms": [
      "Soyut organ yanıtı"
    ],
    "immuneResponseType": "Doğal ve edinilmiş antibakteriyel yanıt",
    "cellularMechanism": "Bakteriyel yük ve doğal bağışıklık yanıtı.",
    "educationalTimeline": [
      {
        "phase": "baseline",
        "label": "Başlangıç ve mekanizma",
        "start": 0,
        "end": 2
      },
      {
        "phase": "response",
        "label": "Belirti ve hücresel etki",
        "start": 3,
        "end": 7
      },
      {
        "phase": "observation",
        "label": "İzlem ve karşılaştırma",
        "start": 8,
        "end": 14
      }
    ],
    "timelineDisclaimer": "0–14 eğitim adımı gerçek kuluçka, hastalık süresi veya prognoz tahmini değildir. Kronik hastalıklar hızlandırılmış kavramsal adımlarla gösterilir.",
    "sources": [
      {
        "title": "MedlinePlus: Infections",
        "url": "https://medlineplus.gov/infections.html",
        "accessedAt": "2026-10-12"
      }
    ],
    "affectedSystems": [
      "respiratory",
      "systemic"
    ],
    "symptomProfile": {
      "respiratory": 16,
      "systemic": 15
    },
    "contagious": true,
    "publicSpreadApplicable": true
  },
  {
    "id": "pneumonia",
    "name": "Bakteriyel pnömoni",
    "category": "bacterial",
    "codePrefix": "PNE",
    "description": "Bakteriyel yük ve doğal bağışıklık yanıtı.",
    "initialDiagnosis": "Bakteriyel enfeksiyon olasılığı",
    "growth": 1.27,
    "immuneRate": 0.92,
    "profileType": "legacy-educational",
    "mechanism": "infectious/bacterial",
    "typicalSymptoms": [
      "Soyut organ yanıtı"
    ],
    "immuneResponseType": "Doğal ve edinilmiş antibakteriyel yanıt",
    "cellularMechanism": "Bakteriyel yük ve doğal bağışıklık yanıtı.",
    "educationalTimeline": [
      {
        "phase": "baseline",
        "label": "Başlangıç ve mekanizma",
        "start": 0,
        "end": 2
      },
      {
        "phase": "response",
        "label": "Belirti ve hücresel etki",
        "start": 3,
        "end": 7
      },
      {
        "phase": "observation",
        "label": "İzlem ve karşılaştırma",
        "start": 8,
        "end": 14
      }
    ],
    "timelineDisclaimer": "0–14 eğitim adımı gerçek kuluçka, hastalık süresi veya prognoz tahmini değildir. Kronik hastalıklar hızlandırılmış kavramsal adımlarla gösterilir.",
    "sources": [
      {
        "title": "MedlinePlus: Infections",
        "url": "https://medlineplus.gov/infections.html",
        "accessedAt": "2026-10-12"
      }
    ],
    "affectedSystems": [
      "respiratory"
    ],
    "symptomProfile": {
      "respiratory": 18
    },
    "contagious": true,
    "publicSpreadApplicable": true
  },
  {
    "id": "foodborne",
    "name": "Gıda kaynaklı bakteriyel enfeksiyon",
    "category": "bacterial",
    "codePrefix": "FOD",
    "description": "Bakteriyel yük ve doğal bağışıklık yanıtı.",
    "initialDiagnosis": "Bakteriyel enfeksiyon olasılığı",
    "growth": 1.19,
    "immuneRate": 1.02,
    "profileType": "legacy-educational",
    "mechanism": "infectious/bacterial",
    "typicalSymptoms": [
      "Soyut organ yanıtı"
    ],
    "immuneResponseType": "Doğal ve edinilmiş antibakteriyel yanıt",
    "cellularMechanism": "Bakteriyel yük ve doğal bağışıklık yanıtı.",
    "educationalTimeline": [
      {
        "phase": "baseline",
        "label": "Başlangıç ve mekanizma",
        "start": 0,
        "end": 2
      },
      {
        "phase": "response",
        "label": "Belirti ve hücresel etki",
        "start": 3,
        "end": 7
      },
      {
        "phase": "observation",
        "label": "İzlem ve karşılaştırma",
        "start": 8,
        "end": 14
      }
    ],
    "timelineDisclaimer": "0–14 eğitim adımı gerçek kuluçka, hastalık süresi veya prognoz tahmini değildir. Kronik hastalıklar hızlandırılmış kavramsal adımlarla gösterilir.",
    "sources": [
      {
        "title": "MedlinePlus: Infections",
        "url": "https://medlineplus.gov/infections.html",
        "accessedAt": "2026-10-12"
      }
    ],
    "affectedSystems": [
      "digestive",
      "systemic"
    ],
    "symptomProfile": {
      "digestive": 16,
      "systemic": 23
    },
    "contagious": true,
    "publicSpreadApplicable": true
  },
  {
    "id": "meningitis-like",
    "name": "Menenjit benzeri senaryo",
    "category": "bacterial",
    "codePrefix": "MEN",
    "description": "Bakteriyel yük ve doğal bağışıklık yanıtı.",
    "initialDiagnosis": "Bakteriyel enfeksiyon olasılığı",
    "growth": 1.3,
    "immuneRate": 0.87,
    "profileType": "legacy-educational",
    "mechanism": "infectious/bacterial",
    "typicalSymptoms": [
      "Soyut organ yanıtı"
    ],
    "immuneResponseType": "Doğal ve edinilmiş antibakteriyel yanıt",
    "cellularMechanism": "Bakteriyel yük ve doğal bağışıklık yanıtı.",
    "educationalTimeline": [
      {
        "phase": "baseline",
        "label": "Başlangıç ve mekanizma",
        "start": 0,
        "end": 2
      },
      {
        "phase": "response",
        "label": "Belirti ve hücresel etki",
        "start": 3,
        "end": 7
      },
      {
        "phase": "observation",
        "label": "İzlem ve karşılaştırma",
        "start": 8,
        "end": 14
      }
    ],
    "timelineDisclaimer": "0–14 eğitim adımı gerçek kuluçka, hastalık süresi veya prognoz tahmini değildir. Kronik hastalıklar hızlandırılmış kavramsal adımlarla gösterilir.",
    "sources": [
      {
        "title": "MedlinePlus: Infections",
        "url": "https://medlineplus.gov/infections.html",
        "accessedAt": "2026-10-12"
      }
    ],
    "affectedSystems": [
      "neurological",
      "systemic"
    ],
    "symptomProfile": {
      "neurological": 15,
      "systemic": 17
    },
    "contagious": true,
    "publicSpreadApplicable": true
  },
  {
    "id": "atypical-influenza",
    "name": "Atipik influenza",
    "category": "mixed",
    "codePrefix": "ATY",
    "description": "Bakteriyel yük ve doğal bağışıklık yanıtı.",
    "initialDiagnosis": "Bakteriyel enfeksiyon olasılığı",
    "growth": 1.21,
    "immuneRate": 1.02,
    "profileType": "legacy-educational",
    "mechanism": "infectious/mixed",
    "typicalSymptoms": [
      "Soyut organ yanıtı"
    ],
    "immuneResponseType": "Doğal ve edinilmiş antibakteriyel yanıt",
    "cellularMechanism": "Bakteriyel yük ve doğal bağışıklık yanıtı.",
    "educationalTimeline": [
      {
        "phase": "baseline",
        "label": "Başlangıç ve mekanizma",
        "start": 0,
        "end": 2
      },
      {
        "phase": "response",
        "label": "Belirti ve hücresel etki",
        "start": 3,
        "end": 7
      },
      {
        "phase": "observation",
        "label": "İzlem ve karşılaştırma",
        "start": 8,
        "end": 14
      }
    ],
    "timelineDisclaimer": "0–14 eğitim adımı gerçek kuluçka, hastalık süresi veya prognoz tahmini değildir. Kronik hastalıklar hızlandırılmış kavramsal adımlarla gösterilir.",
    "sources": [
      {
        "title": "MedlinePlus: Infections",
        "url": "https://medlineplus.gov/infections.html",
        "accessedAt": "2026-10-12"
      }
    ],
    "affectedSystems": [
      "respiratory",
      "digestive"
    ],
    "symptomProfile": {
      "respiratory": 20,
      "digestive": 8,
      "onsetDay": 4
    },
    "contagious": true,
    "publicSpreadApplicable": true
  },
  {
    "id": "flu-gi",
    "name": "Grip + gastrointestinal semptom",
    "category": "mixed",
    "codePrefix": "FGI",
    "description": "Bakteriyel yük ve doğal bağışıklık yanıtı.",
    "initialDiagnosis": "Bakteriyel enfeksiyon olasılığı",
    "growth": 1.23,
    "immuneRate": 1.05,
    "profileType": "legacy-educational",
    "mechanism": "infectious/mixed",
    "typicalSymptoms": [
      "Soyut organ yanıtı"
    ],
    "immuneResponseType": "Doğal ve edinilmiş antibakteriyel yanıt",
    "cellularMechanism": "Bakteriyel yük ve doğal bağışıklık yanıtı.",
    "educationalTimeline": [
      {
        "phase": "baseline",
        "label": "Başlangıç ve mekanizma",
        "start": 0,
        "end": 2
      },
      {
        "phase": "response",
        "label": "Belirti ve hücresel etki",
        "start": 3,
        "end": 7
      },
      {
        "phase": "observation",
        "label": "İzlem ve karşılaştırma",
        "start": 8,
        "end": 14
      }
    ],
    "timelineDisclaimer": "0–14 eğitim adımı gerçek kuluçka, hastalık süresi veya prognoz tahmini değildir. Kronik hastalıklar hızlandırılmış kavramsal adımlarla gösterilir.",
    "sources": [
      {
        "title": "MedlinePlus: Infections",
        "url": "https://medlineplus.gov/infections.html",
        "accessedAt": "2026-10-12"
      }
    ],
    "affectedSystems": [
      "respiratory",
      "digestive"
    ],
    "symptomProfile": {
      "respiratory": 19,
      "digestive": 8,
      "onsetDay": 4
    },
    "contagious": true,
    "publicSpreadApplicable": true
  },
  {
    "id": "immunosuppressed",
    "name": "Bağışıklığı baskılanmış hastada ağır enfeksiyon",
    "category": "mixed",
    "codePrefix": "IMS",
    "description": "Bakteriyel yük ve doğal bağışıklık yanıtı.",
    "initialDiagnosis": "Bakteriyel enfeksiyon olasılığı",
    "growth": 1.3,
    "immuneRate": 0.5,
    "profileType": "legacy-educational",
    "mechanism": "infectious/mixed",
    "typicalSymptoms": [
      "Soyut organ yanıtı"
    ],
    "immuneResponseType": "Doğal ve edinilmiş antibakteriyel yanıt",
    "cellularMechanism": "Bakteriyel yük ve doğal bağışıklık yanıtı.",
    "educationalTimeline": [
      {
        "phase": "baseline",
        "label": "Başlangıç ve mekanizma",
        "start": 0,
        "end": 2
      },
      {
        "phase": "response",
        "label": "Belirti ve hücresel etki",
        "start": 3,
        "end": 7
      },
      {
        "phase": "observation",
        "label": "İzlem ve karşılaştırma",
        "start": 8,
        "end": 14
      }
    ],
    "timelineDisclaimer": "0–14 eğitim adımı gerçek kuluçka, hastalık süresi veya prognoz tahmini değildir. Kronik hastalıklar hızlandırılmış kavramsal adımlarla gösterilir.",
    "sources": [
      {
        "title": "MedlinePlus: Infections",
        "url": "https://medlineplus.gov/infections.html",
        "accessedAt": "2026-10-12"
      }
    ],
    "affectedSystems": [
      "respiratory",
      "systemic"
    ],
    "symptomProfile": {
      "respiratory": 15,
      "systemic": 12
    },
    "contagious": true,
    "publicSpreadApplicable": true
  }
];
export const DISEASE_PROFILES = RAW_DISEASE_PROFILES.map(enrichDiseaseProfile);
export const LEGACY_SCENARIOS = RAW_LEGACY_SCENARIOS.map(enrichDiseaseProfile);
export const SCENARIOS = [...DISEASE_PROFILES, ...LEGACY_SCENARIOS];
export const DISEASE_MECHANISMS = ["infectious/viral","infectious/bacterial","infectious/mixed","genetic","autoimmune","metabolic","neurological","oncology"];
