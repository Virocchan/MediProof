// Comprehensive Medical Fact-Checking Sample Data aligned with SDG 3

export const SAMPLE_CLAIMS = {
  text: [
    {
      id: 'txt-1',
      title: 'Colloidal Silver Virus Cure',
      claim: 'Drinking raw colloidal silver water completely eliminates viral lung infections and kills all pathogens in the bloodstream within 48 hours.',
      category: 'Infectious Disease',
      expectedVerdict: 'False',
      verdict: 'False',
      confidence: 99,
      explanation: 'Colloidal silver is neither safe nor effective for treating any viral infection. It can cause irreversible organ damage and argyria (permanent blue-gray skin discoloration).',
      sources: [
        { name: 'U.S. FDA Advisory', url: 'https://www.fda.gov/consumers/consumer-updates/beware-fraudulent-coronavirus-tests-vaccines-and-treatments', type: 'FDA' },
        { name: 'WHO Fact Sheet: Consumer Safety', url: 'https://www.who.int', type: 'WHO' },
        { name: 'CDC Clinical Toxicology', url: 'https://www.cdc.gov', type: 'CDC' }
      ],
      model: 'openai/gpt-oss-120b (via Groq)',
      workflowRoute: 'Switch -> Text -> Basic LLM Chain'
    },
    {
      id: 'txt-2',
      title: 'Dietary Fiber & Diabetes Reduction',
      claim: 'Consuming 25 to 30 grams of natural dietary fiber daily helps regulate blood glucose spikes and lowers long-term risk of developing Type 2 Diabetes.',
      category: 'Nutrition & Metabolic Health',
      expectedVerdict: 'True',
      verdict: 'True',
      confidence: 97,
      explanation: 'Substantial clinical and epidemiological evidence confirms that soluble dietary fiber slows carbohydrate absorption and improves insulin sensitivity.',
      sources: [
        { name: 'WHO Healthy Diet Guidelines', url: 'https://www.who.int/news-room/fact-sheets/detail/healthy-diet', type: 'WHO' },
        { name: 'CDC Diabetes Prevention Program', url: 'https://www.cdc.gov/diabetes/prevention/index.html', type: 'CDC' },
        { name: 'MOH Clinical Practice Guidelines', url: 'https://www.moh.gov.my', type: 'MOH' }
      ],
      model: 'openai/gpt-oss-120b (via Groq)',
      workflowRoute: 'Switch -> Text -> Basic LLM Chain'
    },
    {
      id: 'txt-3',
      title: 'Garlic Soup Prevents All Flu & Viral Infection',
      claim: 'Eating boiled garlic soup every morning creates an immune shield that 100% prevents you from catching seasonal influenza and respiratory viruses.',
      category: 'Complementary Medicine',
      expectedVerdict: 'Misleading',
      verdict: 'Misleading',
      confidence: 92,
      explanation: 'While garlic possesses mild antimicrobial properties and allicin, there is zero clinical evidence that it provides complete immunity against influenza or respiratory infections.',
      sources: [
        { name: 'WHO Mythbusters: Garlic and Viruses', url: 'https://www.who.int/emergencies/diseases/novel-coronavirus-2019/advice-for-public/myth-busters', type: 'WHO' },
        { name: 'National Center for Complementary Health', url: 'https://www.nccih.nih.gov/health/garlic', type: 'NIH' }
      ],
      model: 'openai/gpt-oss-120b (via Groq)',
      workflowRoute: 'Switch -> Text -> Basic LLM Chain'
    }
  ],

  youtube: [
    {
      id: 'yt-1',
      url: 'https://www.youtube.com/watch?v=d_k82X19k9a',
      title: 'The "Secret Miracle Drink" That Dissolves Gallstones & Kidney Stones Overnight',
      channel: 'Holistic Health Secrets (340K subscribers)',
      duration: '14:28',
      thumbnail: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&auto=format&fit=crop&q=80',
      extractedClaim: 'Drinking a mixture of extra virgin olive oil and fresh lemon juice flushed out 50 green gallstones within 12 hours without surgery.',
      verdict: 'False',
      confidence: 96,
      explanation: 'The supposed "stones" passed after an olive oil flush are actually saponified oil complexes formed in the gut, not true gallstones. Delayed treatment of real cholelithiasis can lead to acute cholecystitis.',
      sources: [
        { name: 'CDC Gallstone Disease Review', url: 'https://www.cdc.gov', type: 'CDC' },
        { name: 'WHO Surgical Safety Protocols', url: 'https://www.who.int', type: 'WHO' },
        { name: 'The Lancet: Could these be gallstones?', url: 'https://www.thelancet.com', type: 'PubMed' }
      ],
      model: 'models/gemini-2.5-flash (via Google Gemini)',
      workflowRoute: 'Switch -> youtube -> Basic LLM Chain3'
    },
    {
      id: 'yt-2',
      url: 'https://www.youtube.com/watch?v=WHO_Sodium_Guidelines_2025',
      title: 'Global Guidelines on Sodium Intake & Prevention of Hypertension',
      channel: 'World Health Organization Official (1.2M subscribers)',
      duration: '06:12',
      thumbnail: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=400&auto=format&fit=crop&q=80',
      extractedClaim: 'Limiting sodium intake to less than 2,000 mg per day substantially reduces blood pressure and cardiovascular disease risk in adults.',
      verdict: 'True',
      confidence: 98,
      explanation: 'Rigorous international trials establish a direct correlation between high dietary sodium and elevated arterial pressure. Reducing sodium intake saves millions of lives annually.',
      sources: [
        { name: 'WHO Sodium Intake for Adults and Children', url: 'https://www.who.int/publications/i/item/9789241504836', type: 'WHO' },
        { name: 'AHA Dietary Guidelines', url: 'https://www.heart.org', type: 'AHA' }
      ],
      model: 'models/gemini-2.5-flash (via Google Gemini)',
      workflowRoute: 'Switch -> youtube -> Basic LLM Chain3'
    }
  ],

  voice: [
    {
      id: 'vc-1',
      title: 'WhatsApp Viral Audio on Salt Water Gargling',
      audioUrl: 'https://files.catbox.moe/fsddqm.wav',
      localAudioUrl: 'http://host.docker.internal:3000/uploads/sample_voice_salt_water.wav',
      filename: 'sample_voice_salt_water.wav',
      duration: '00:24',
      verdict: 'False',
      confidence: 98,
      explanation: 'Respiratory viruses infect the nasopharynx and mucosal epithelial cells within minutes of exposure. Saline gargles soothe throat irritation but do not neutralize or prevent viral replication in respiratory tissue.',
      sources: [
        { name: 'WHO Public Health Clarification', url: 'https://www.who.int', type: 'WHO' },
        { name: 'MOH National Health Advisory', url: 'https://www.moh.gov.my', type: 'MOH' },
        { name: 'CDC Infection Prevention', url: 'https://www.cdc.gov', type: 'CDC' }
      ],
      model: 'whisper-large-v3-turbo -> openai/gpt-oss-120b',
      workflowRoute: 'Switch -> Voice -> Get a file1 -> Code (voice.ogg) -> Whisper API -> Basic LLM Chain2'
    },
    {
      id: 'vc-2',
      title: 'Voice Memo: Aerobic Exercise for Hypertension',
      audioUrl: 'https://files.catbox.moe/1asj5v.wav',
      localAudioUrl: 'http://host.docker.internal:3000/uploads/sample_voice_hypertension.wav',
      filename: 'sample_voice_hypertension.wav',
      duration: '00:19',
      verdict: 'True',
      confidence: 96,
      explanation: 'Regular aerobic physical activity stimulates nitric oxide production, promotes vasodilation, and is a first-line non-pharmacological intervention for hypertension.',
      sources: [
        { name: 'CDC Physical Activity Guidelines', url: 'https://www.cdc.gov/physicalactivity/index.html', type: 'CDC' },
        { name: 'WHO Guidelines on Physical Activity and Sedentary Behaviour', url: 'https://www.who.int', type: 'WHO' }
      ],
      model: 'whisper-large-v3-turbo -> openai/gpt-oss-120b',
      workflowRoute: 'Switch -> Voice -> Get a file1 -> Code (voice.ogg) -> Whisper API -> Basic LLM Chain2'
    }
  ],

  photo: [
    {
      id: 'ph-1',
      title: 'Counterfeit "Miracle Stem Cell Slim & Gluta" Supplement',
      image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80',
      tag: 'Supplement Bottle & Label',
      extractedText: 'StemCell Ultra 50000mg. Fast Slimming & Permanent Whitening. Approved by MOH / FDA. Reg. No. MAL19920199X. 100% Organic Miracle.',
      verdict: 'False',
      confidence: 97,
      explanation: 'Registration number MAL19920199X is fraudulent and does not exist in the National Pharmaceutical Regulatory Agency (NPRA) registry. Claims of "permanent whitening" and "miracle slimming" violate pharmaceutical advertising regulations.',
      sources: [
        { name: 'MOH NPRA Drug Registration Verification', url: 'https://quest3plus.bpfk.gov.my', type: 'MOH' },
        { name: 'U.S. FDA Warning on Fraudulent Dietary Supplements', url: 'https://www.fda.gov', type: 'FDA' },
        { name: 'WHO Medical Product Alert on Substandard Drugs', url: 'https://www.who.int', type: 'WHO' }
      ],
      boundingBoxes: [
        { top: '38%', left: '20%', width: '60%', height: '14%', label: 'Fake MOH Reg No: MAL19920199X' },
        { top: '56%', left: '15%', width: '70%', height: '18%', label: 'Illegal Drug Claim: "Permanent Whitening"' }
      ],
      model: 'models/gemini-2.5-flash (Vision) via Google Gemini',
      workflowRoute: 'Switch -> Photo -> Edit Fields -> Get a file -> Basic LLM Chain1'
    },
    {
      id: 'ph-2',
      title: 'Infographic: "Acidic Blood Causes Cancer, Alkaline Water Cures It"',
      image: 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=600&auto=format&fit=crop&q=80',
      tag: 'Medical Infographic',
      extractedText: 'Cancer cannot survive in an alkaline environment! Drink pH 9.5 alkaline water to eliminate cancer cells and detoxify your bloodstream.',
      verdict: 'False',
      confidence: 99,
      explanation: 'Human blood pH is tightly regulated between 7.35 and 7.45 by the kidneys and lungs. Dietary intake or drinking alkaline water cannot significantly alter systemic blood pH, and the alkaline cancer myth has been thoroughly debunked by oncology societies.',
      sources: [
        { name: 'American Institute for Cancer Research (AICR)', url: 'https://www.aicr.org', type: 'AICR' },
        { name: 'WHO Global Action Against Cancer', url: 'https://www.who.int', type: 'WHO' },
        { name: 'CDC Cancer Prevention Guide', url: 'https://www.cdc.gov/cancer', type: 'CDC' }
      ],
      boundingBoxes: [
        { top: '25%', left: '15%', width: '70%', height: '22%', label: 'Pseudoscience Claim: "Blood pH Alteration"' }
      ],
      model: 'models/gemini-2.5-flash (Vision) via Google Gemini',
      workflowRoute: 'Switch -> Photo -> Edit Fields -> Get a file -> Basic LLM Chain1'
    }
  ]
};

export const INITIAL_VERIFICATION_HISTORY = [
  {
    id: 'VER-8901',
    timestamp: '2026-09-05 19:42',
    modality: 'Text',
    claimSnippet: 'Drinking raw colloidal silver water completely eliminates viral lung infections...',
    verdict: 'False',
    confidence: 99,
    authority: 'FDA / WHO',
    latency: '1.2s'
  },
  {
    id: 'VER-8902',
    timestamp: '2026-09-05 18:15',
    modality: 'Photo',
    claimSnippet: 'StemCell Ultra 50000mg. Fake MOH MAL19920199X registration label...',
    verdict: 'False',
    confidence: 97,
    authority: 'MOH NPRA',
    latency: '2.1s'
  },
  {
    id: 'VER-8903',
    timestamp: '2026-09-05 16:30',
    modality: 'YouTube',
    claimSnippet: 'Global Guidelines on Sodium Intake & Prevention of Hypertension (WHO)',
    verdict: 'True',
    confidence: 98,
    authority: 'WHO / AHA',
    latency: '1.8s'
  },
  {
    id: 'VER-8904',
    timestamp: '2026-09-05 14:10',
    modality: 'Voice',
    claimSnippet: 'WhatsApp voice audio: salt water with lemon kills virus in throat...',
    verdict: 'False',
    confidence: 98,
    authority: 'WHO / MOH',
    latency: '3.4s'
  },
  {
    id: 'VER-8905',
    timestamp: '2026-09-05 11:20',
    modality: 'Text',
    claimSnippet: 'Consuming 25 to 30 grams of natural dietary fiber daily helps regulate blood glucose...',
    verdict: 'True',
    confidence: 97,
    authority: 'WHO / CDC',
    latency: '1.1s'
  }
];
