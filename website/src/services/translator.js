// MediProof Health Output Translation Service
// Translates medical fact-check verdicts, plain explanations, and citations into user-selected languages

export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English (Original)', flag: '🇺🇸' },
  { code: 'ms', label: 'Bahasa Melayu', flag: '🇲🇾' },
  { code: 'zh-CN', label: '简体中文 (Chinese)', flag: '🇨🇳' },
  { code: 'ta', label: 'தமிழ் (Tamil)', flag: '🇮🇳' },
  { code: 'id', label: 'Bahasa Indonesia', flag: '🇮🇩' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'ar', label: 'العربية', flag: '🇸🇦' },
  { code: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' }
];

const DICTIONARY = {
  titles: {
    True: {
      en: 'VERIFIED: REAL & ACCURATE',
      ms: 'DISAHKAN: BENAR & TEPAT',
      'zh-CN': '已核实：真实且准确',
      ta: 'சரிபார்க்கப்பட்டது: உண்மை & துல்லியமானது',
      id: 'TERVERIFIKASI: BENAR & AKURAT',
      es: 'VERIFICADO: REAL Y EXACTO',
      ar: 'مُؤكد: حقيقي ودقيق',
      hi: 'सत्यापित: सही और सटीक',
      fr: 'VÉRIFIÉ : VRAI ET EXACT'
    },
    False: {
      en: 'ALERT: FAKE CLAIM / FALSE',
      ms: 'AMARAN: DAKWAAN PALSU / TIDAK BENAR',
      'zh-CN': '警报：虚假主张 / 不实',
      ta: 'எச்சரிக்கை: போலி கூற்று / தவறு',
      id: 'PERINGATAN: KLAIM PALSU / SALAH',
      es: 'ALERTA: AFIRMACIÓN FALSA',
      ar: 'تحذير: ادعاء كاذب / غير صحيح',
      hi: 'चेतावनी: फर्जी दावा / असत्य',
      fr: 'ALERTE : FAUSSE DÉCLARATION'
    },
    Misleading: {
      en: 'WARNING: MISLEADING CLAIM',
      ms: 'AMARAN: DAKWAAN MENGELIRUKAN',
      'zh-CN': '警告：具有误导性的主张',
      ta: 'எச்சரிக்கை: தவறாக வழிநடத்தும் கூற்று',
      id: 'PERINGATAN: KLAIM MENYESATKAN',
      es: 'ADVERTENCIA: AFIRMACIÓN ENGAÑOSA',
      ar: 'تحذير: ادعاء مضلل',
      hi: 'चेतावनी: भ्रामक दावा',
      fr: 'ATTENTION : ALLÉGATION TROMPEUSE'
    },
    Unverified: {
      en: 'UNVERIFIED / UNPROVEN',
      ms: 'BELUM DISAHKAN / TIADA BUKTI',
      'zh-CN': '未证实 / 缺乏科学证据',
      ta: 'சரிபார்க்கப்படவில்லை / ஆதாரமற்றது',
      id: 'BELUM DIVERIFIKASI / BELUM TERBUKTI',
      es: 'NO VERIFICADO / NO PROBADO',
      ar: 'غير مؤكد / غير مثبت',
      hi: 'असत्यापित / अप्रमाणित',
      fr: 'NON VÉRIFIÉ / NON PROUVÉ'
    }
  },
  subtitles: {
    True: {
      en: 'This statement is supported by medical facts and health guidelines.',
      ms: 'Kenyataan ini disokong oleh fakta perubatan dan garis panduan kesihatan rasmi.',
      'zh-CN': '该说法得到医学事实和官方卫生指南的支持。',
      ta: 'இந்தக் கூற்று மருத்துவ உண்மைகள் மற்றும் சுகாதார வழிகாட்டுதல்களால் ஆதரிக்கப்படுகிறது.',
      id: 'Pernyataan ini didukung oleh fakta medis dan pedoman kesehatan resmi.',
      es: 'Esta afirmación está respaldada por hechos médicos y pautas de salud.',
      ar: 'هذا البيان مدعوم بالحقائق الطبية وإرشادات الصحة الرسمية.',
      hi: 'यह बयान चिकित्सा तथ्यों और स्वास्थ्य दिशानिर्देशों द्वारा समर्थित है।',
      fr: 'Cette déclaration est étayée par des faits médicaux et des directives de santé.'
    },
    False: {
      en: 'This claim is medically inaccurate and could be harmful to follow.',
      ms: 'Dakwaan ini tidak tepat dari segi perubatan dan boleh membahayakan kesihatan jika diikuti.',
      'zh-CN': '该说法在医学上不准确，盲目遵循可能对健康有害。',
      ta: 'இந்த கூற்று மருத்துவ ரீதியாக தவறானது மற்றும் பின்பற்றுவது ஆபத்தானது.',
      id: 'Klaim ini tidak akurat secara medis dan dapat berbahaya jika diikuti.',
      es: 'Esta afirmación es médicamente inexacta y podría ser perjudicial seguirla.',
      ar: 'هذا الادعاء غير دقيق طبياً وقد يكون ضاراً عند اتباعه.',
      hi: 'यह दावा चिकित्सकीय रूप से गलत है और इसका पालन करना हानिकारक हो सकता है।',
      fr: 'Cette affirmation est médicalement inexacte et peut être dangereuse à suivre.'
    },
    Misleading: {
      en: 'Contains partial truth but exaggerates benefits or lacks clinical proof.',
      ms: 'Mengandungi sebahagian kebenaran tetapi membesar-besarkan manfaat atau tiada bukti klinikal.',
      'zh-CN': '包含部分事实，但夸大了疗效或缺乏足够的临床依据。',
      ta: 'பகுதி உண்மை உள்ளது, ஆனால் நன்மைகளை மிகைப்படுத்துகிறது அல்லது மருத்துவ ஆதாரம் இல்லை.',
      id: 'Mengandung sebagian kebenaran tetapi melebih-lebihkan manfaat atau kurang bukti klinis.',
      es: 'Contiene verdad parcial pero exagera beneficios o carece de prueba clínica.',
      ar: 'يحتوي على جزء من الحقيقة ولكنه يبالغ في الفوائد أو يفتقر إلى الأدلة السريرية.',
      hi: 'इसमें आंशिक सच्चाई है लेकिन फायदों को बढ़ा-चढ़ाकर पेश किया गया है।',
      fr: 'Contient une part de vérité mais exagère les bienfaits ou manque de preuves.'
    },
    Unverified: {
      en: 'Not enough scientific research to confirm whether this is safe or real.',
      ms: 'Kajian saintifik tidak mencukupi untuk mengesahkan sama ada ini selamat atau berkesan.',
      'zh-CN': '尚无足够科学研究证实其是否安全或真实有效。',
      ta: 'இது பாதுகாப்பானதா அல்லது உண்மையா என்பதை உறுதிப்படுத்த போதுமான அறிவியல் ஆராய்ச்சி இல்லை.',
      id: 'Penelitian ilmiah belum cukup untuk memastikan apakah ini aman atau nyata.',
      es: 'No hay suficiente investigación científica para confirmar si esto es seguro o real.',
      ar: 'لا توجد أبحاث علمية كافية لتأكيد ما إذا كان هذا آمناً أو حقيقياً.',
      hi: 'यह सुरक्षित या वास्तविक है या नहीं, इसकी पुष्टि के लिए पर्याप्त वैज्ञानिक शोध नहीं है।',
      fr: 'Pas assez de recherches scientifiques pour confirmer si cela est sûr ou réel.'
    }
  },
  sectionWhy: {
    en: 'Why is this',
    ms: 'Mengapa ini',
    'zh-CN': '为什么是',
    ta: 'இது ஏன்',
    id: 'Mengapa ini',
    es: '¿Por qué esto es',
    ar: 'لماذا هذا',
    hi: 'यह क्यों है',
    fr: 'Pourquoi est-ce'
  },
  sectionWhySuffix: {
    en: '? (Plain Explanation)',
    ms: '? (Penjelasan Mudah)',
    'zh-CN': '？（通俗解释）',
    ta: '? (எளிய விளக்கம்)',
    id: '? (Penjelasan Sederhana)',
    es: '? (Explicación Sencilla)',
    ar: '؟ (شرح مبسط)',
    hi: '? (सरल स्पष्टीकरण)',
    fr: ' ? (Explication Simple)'
  },
  sectionWhere: {
    en: 'Where did we check this? (Official Health Registries)',
    ms: 'Di manakah kami menyemak ini? (Pendaftaran Kesihatan Rasmi)',
    'zh-CN': '我们在何处核实此信息？（官方权威健康机构）',
    ta: 'இதை நாம் எங்கு சரிபார்த்தோம்? (அதிகாரப்பூர்வ சுகாதார பதிவேடுகள்)',
    id: 'Di mana kami memeriksa ini? (Registri Kesehatan Resmi)',
    es: '¿Dónde verificamos esto? (Registros Oficiales de Salud)',
    ar: 'أين تم التحقق من ذلك؟ (السجلات الصحية الرسمية)',
    hi: 'हमने इसकी जांच कहां की? (आधिकारिक स्वास्थ्य रजिस्ट्री)',
    fr: 'Où avons-nous vérifié cela ? (Registres Officiels de Santé)'
  },
  verdictWord: {
    True: { en: 'True', ms: 'Benar', 'zh-CN': '真实', ta: 'உண்மை', id: 'Benar', es: 'Verdadero', ar: 'صحيح', hi: 'सही', fr: 'Vrai' },
    False: { en: 'False', ms: 'Palsu', 'zh-CN': '虚假', ta: 'தவறு', id: 'Palsu', es: 'Falso', ar: 'كاذب', hi: 'असत्य', fr: 'Faux' },
    Misleading: { en: 'Misleading', ms: 'Mengelirukan', 'zh-CN': '具有误导性', ta: 'தவறாக வழிநடத்துவது', id: 'Menyesatkan', es: 'Engañoso', ar: 'مضلل', hi: 'भ्रामक', fr: 'Trompeur' },
    Unverified: { en: 'Unverified', ms: 'Belum Disahkan', 'zh-CN': '未证实', ta: 'சரிபார்க்கப்படவில்லை', id: 'Belum Diverifikasi', es: 'No Verificado', ar: 'غير مؤكد', hi: 'असत्यापित', fr: 'Non vérifié' }
  }
};

class TranslationService {
  constructor() {
    this.cache = new Map();
  }

  getVerdictTitle(verdict, lang = 'en') {
    const v = this.normalizeVerdict(verdict);
    return (DICTIONARY.titles[v] && DICTIONARY.titles[v][lang]) || DICTIONARY.titles[v]?.en || verdict;
  }

  getVerdictSubtitle(verdict, lang = 'en') {
    const v = this.normalizeVerdict(verdict);
    return (DICTIONARY.subtitles[v] && DICTIONARY.subtitles[v][lang]) || DICTIONARY.subtitles[v]?.en || '';
  }

  getWhyHeader(verdict, lang = 'en') {
    const v = this.normalizeVerdict(verdict);
    const translatedVerdict = (DICTIONARY.verdictWord[v] && DICTIONARY.verdictWord[v][lang]) || v;
    const prefix = DICTIONARY.sectionWhy[lang] || DICTIONARY.sectionWhy.en;
    const suffix = DICTIONARY.sectionWhySuffix[lang] || DICTIONARY.sectionWhySuffix.en;
    return `${prefix} ${translatedVerdict}${suffix}`;
  }

  getWhereHeader(lang = 'en') {
    return DICTIONARY.sectionWhere[lang] || DICTIONARY.sectionWhere.en;
  }

  normalizeVerdict(verdict) {
    const lower = (verdict || '').toLowerCase();
    if (lower.includes('true')) return 'True';
    if (lower.includes('false')) return 'False';
    if (lower.includes('misleading')) return 'Misleading';
    return 'Unverified';
  }

  async translateExplanation(text, targetLang) {
    if (!text) return '';
    if (targetLang === 'en') return text;

    const cacheKey = `${targetLang}:${text}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, targetLang, sourceLang: 'en' })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.ok && data.translatedText) {
          this.cache.set(cacheKey, data.translatedText);
          return data.translatedText;
        }
      }
    } catch (e) {
      console.warn('[Translation Error]:', e);
    }

    return text;
  }
}

export const translator = new TranslationService();
