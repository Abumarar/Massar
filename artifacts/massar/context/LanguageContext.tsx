import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { I18nManager, NativeModules, Platform } from 'react-native';

export type Language = 'en' | 'ar';

export type TranslationKey =
  | 'tagline'
  | 'home'
  | 'trips'
  | 'profile'
  | 'planRide'
  | 'from'
  | 'to'
  | 'jerash'
  | 'amman'
  | 'useCurrentLocation'
  | 'findingLocation'
  | 'howManySeats'
  | 'bringEveryone'
  | 'seat'
  | 'seats'
  | 'estimatedTotal'
  | 'perSeat'
  | 'findRide'
  | 'routeMatched'
  | 'verifiedCaptains'
  | 'fairPricing'
  | 'recentRides'
  | 'seeAll'
  | 'noCompletedRides'
  | 'availableRides'
  | 'betterWayToGo'
  | 'foundCaptain'
  | 'pickup'
  | 'arrivesIn'
  | 'seatsLeft'
  | 'captain'
  | 'plate'
  | 'confirmRide'
  | 'readyWhenYouAre'
  | 'reviewRide'
  | 'passengers'
  | 'vehicle'
  | 'requestRide'
  | 'keepBrowsing'
  | 'privacyMessage'
  | 'rideRequested'
  | 'viewTrip'
  | 'locationPermissionNeeded'
  | 'allowLocation'
  | 'pickupLocated'
  | 'locationUnavailable'
  | 'yourRides'
  | 'journal'
  | 'nextRoute'
  | 'nextRouteDescription'
  | 'yourSpace'
  | 'preferences'
  | 'language'
  | 'notifications'
  | 'safetyPrivacy'
  | 'protected'
  | 'passengerMode'
  | 'intercityCare'
  | 'riderPricing'
  | 'riderPricingDescription'
  | 'baseSeatPrice'
  | 'discountThreeSeats'
  | 'discountFourSeats'
  | 'pricingPreview'
  | 'discount'
  | 'wholeCar'
  | 'pricingRule'
  | 'languageEnglish'
  | 'languageArabic'
  // Auth & Onboarding keys
  | 'welcomeToMassar'
  | 'welcomeSubtitle'
  | 'passengerRole'
  | 'passengerRoleDesc'
  | 'captainRole'
  | 'captainRoleDesc'
  | 'chooseAccountType'
  | 'continueButton'
  | 'passengerLoginTitle'
  | 'passengerLoginSub'
  | 'captainLoginTitle'
  | 'captainLoginSub'
  | 'passengerRegisterTitle'
  | 'passengerRegisterSub'
  | 'captainRegisterTitle'
  | 'captainRegisterSub'
  | 'phoneNumber'
  | 'phonePlaceholder'
  | 'password'
  | 'passwordPlaceholder'
  | 'passwordRegisterPlaceholder'
  | 'fullName'
  | 'fullNamePlaceholder'
  | 'logIn'
  | 'signUp'
  | 'dontHaveAccount'
  | 'alreadyHaveAccount'
  | 'signUpPassenger'
  | 'signUpCaptain'
  | 'switchToCaptain'
  | 'switchToPassenger'
  | 'areYouCaptain'
  | 'areYouPassenger'
  | 'enterPhoneAndPassword'
  | 'fillAllFields'
  | 'loginFailed'
  | 'registrationFailed'
  | 'invalidCredentials'
  | 'back'
  | 'logout'
  | 'confirmLogout'
  | 'cancel'
  | 'switchLanguage'
  | 'adminArea'
  | 'adminDashboard'
  | 'jordan'
  | 'fastSafeReliable'
  | 'verifiedFleet';

const translations: Record<Language, Record<TranslationKey, string>> = {
  en: {
    tagline: 'Your trip starts from here',
    home: 'Home',
    trips: 'Trips',
    profile: 'Profile',
    planRide: 'PLAN YOUR RIDE',
    from: 'From',
    to: 'To',
    jerash: 'Jerash',
    amman: 'Amman',
    useCurrentLocation: 'Use current location',
    findingLocation: 'Finding your location…',
    howManySeats: 'How many seats?',
    bringEveryone: 'Bring everyone along.',
    seat: 'seat',
    seats: 'seats',
    estimatedTotal: 'Estimated total',
    perSeat: 'per seat',
    findRide: 'Find a ride',
    routeMatched: 'Route matched',
    verifiedCaptains: 'Verified captains',
    fairPricing: 'Fair pricing',
    recentRides: 'Your recent rides',
    seeAll: 'See all',
    noCompletedRides: 'No completed rides yet',
    availableRides: 'Available rides',
    betterWayToGo: 'A better way to go.',
    foundCaptain: 'We found a captain already heading your way.',
    pickup: 'Pickup',
    arrivesIn: 'Arrives in',
    seatsLeft: 'Seats left',
    captain: 'Captain',
    plate: 'Plate',
    confirmRide: 'Confirm ride',
    readyWhenYouAre: 'Ready when you are.',
    reviewRide: 'Review your ride details before sending the request.',
    passengers: 'Passengers',
    vehicle: 'Vehicle',
    requestRide: 'Request this ride',
    keepBrowsing: 'Keep browsing',
    privacyMessage: 'Your exact location is shared only with the captain assigned to this ride.',
    rideRequested: 'Ride requested',
    viewTrip: 'View trip',
    locationPermissionNeeded: 'Location permission needed',
    allowLocation: 'Allow location access to use your current pickup point.',
    pickupLocated: 'Pickup located',
    locationUnavailable: 'Location unavailable',
    yourRides: 'Your rides',
    journal: 'MASSAR JOURNAL',
    nextRoute: 'Your next route starts here',
    nextRouteDescription: 'Book a seat for your next Jerash to Amman trip and it will appear here.',
    yourSpace: 'YOUR SPACE',
    preferences: 'Preferences',
    language: 'Language',
    notifications: 'Notifications',
    safetyPrivacy: 'Safety and privacy',
    protected: 'Protected',
    passengerMode: 'Passenger mode · Prototype',
    intercityCare: 'Intercity travel, shared with care.',
    riderPricing: 'Rider pricing',
    riderPricingDescription: 'Set the price per seat and optional bundle discounts.',
    baseSeatPrice: 'Price per seat',
    discountThreeSeats: '3-seat discount',
    discountFourSeats: '4-seat discount',
    pricingPreview: 'Fare preview',
    discount: 'discount',
    wholeCar: 'whole car',
    pricingRule: 'More seats always cost more. Discounts only reduce the normal total.',
    languageEnglish: 'English',
    languageArabic: 'العربية',
    // Auth & Onboarding
    welcomeToMassar: 'Welcome to Massar',
    welcomeSubtitle: 'Smart and reliable intercity ride-sharing across Jordan.',
    passengerRole: 'Passenger',
    passengerRoleDesc: 'Book seats, travel smoothly, and enjoy transparent pricing.',
    captainRole: 'Captain (Driver)',
    captainRoleDesc: 'Register your vehicle, share rides, and earn reliable income.',
    chooseAccountType: 'How would you like to continue?',
    continueButton: 'Continue',
    passengerLoginTitle: 'Passenger Login',
    passengerLoginSub: 'Log in to book and track your intercity rides.',
    captainLoginTitle: 'Captain Login',
    captainLoginSub: 'Log in to manage trips and receive ride requests.',
    passengerRegisterTitle: 'Create Passenger Account',
    passengerRegisterSub: 'Join Massar and travel comfortably across Jordan.',
    captainRegisterTitle: 'Create Captain Account',
    captainRegisterSub: 'Drive with Massar, connect with riders, and earn.',
    phoneNumber: 'Phone Number',
    phonePlaceholder: '07XXXXXXXX',
    password: 'Password',
    passwordPlaceholder: 'Enter your password',
    passwordRegisterPlaceholder: 'Create a password (min 6 characters)',
    fullName: 'Full Name',
    fullNamePlaceholder: 'e.g. Ahmad Al-Khatib',
    logIn: 'Log in',
    signUp: 'Sign up',
    dontHaveAccount: "Don't have an account?",
    alreadyHaveAccount: 'Already have an account?',
    signUpPassenger: 'Sign up as Passenger',
    signUpCaptain: 'Sign up as Captain',
    switchToCaptain: 'Sign in as Captain',
    switchToPassenger: 'Sign in as Passenger',
    areYouCaptain: 'Are you a Captain?',
    areYouPassenger: 'Are you a Passenger?',
    enterPhoneAndPassword: 'Please enter your phone number and password',
    fillAllFields: 'Please fill in all required fields',
    loginFailed: 'Login Failed',
    registrationFailed: 'Registration Failed',
    invalidCredentials: 'Invalid credentials. Please verify your phone number and password.',
    back: 'Back',
    logout: 'Log out',
    confirmLogout: 'Are you sure you want to log out?',
    cancel: 'Cancel',
    switchLanguage: 'Change Language',
    adminArea: 'Admin Area',
    adminDashboard: 'Admin Dashboard',
    jordan: 'Jordan',
    fastSafeReliable: 'Fast · Safe · Fair Pricing',
    verifiedFleet: 'Verified Fleet',
  },
  ar: {
    tagline: 'توصلها بثقة',
    home: 'الرئيسية',
    trips: 'رحلاتي',
    profile: 'حسابي',
    planRide: 'خطّط لرحلتك',
    from: 'من',
    to: 'إلى',
    jerash: 'جرش',
    amman: 'عمّان',
    useCurrentLocation: 'استخدم موقعي الحالي',
    findingLocation: 'جارٍ تحديد موقعك…',
    howManySeats: 'كم مقعدًا تحتاج؟',
    bringEveryone: 'اصطحب الجميع معك.',
    seat: 'مقعد',
    seats: 'مقاعد',
    estimatedTotal: 'التكلفة التقديرية',
    perSeat: 'للمقعد',
    findRide: 'ابحث عن رحلة',
    routeMatched: 'مسار مناسب',
    verifiedCaptains: 'سائقون موثّقون',
    fairPricing: 'سعر عادل',
    recentRides: 'رحلاتك الأخيرة',
    seeAll: 'عرض الكل',
    noCompletedRides: 'لا توجد رحلات مكتملة بعد',
    availableRides: 'الرحلات المتاحة',
    betterWayToGo: 'طريق أفضل للذهاب.',
    foundCaptain: 'وجدنا سائقًا متجهًا في طريقك.',
    pickup: 'نقطة الانطلاق',
    arrivesIn: 'يصل خلال',
    seatsLeft: 'المقاعد المتاحة',
    captain: 'السائق',
    plate: 'رقم اللوحة',
    confirmRide: 'تأكيد الرحلة',
    readyWhenYouAre: 'جاهزون عندما تكون جاهزًا.',
    reviewRide: 'راجع تفاصيل رحلتك قبل إرسال الطلب.',
    passengers: 'المقاعد',
    vehicle: 'المركبة',
    requestRide: 'اطلب هذه الرحلة',
    keepBrowsing: 'متابعة التصفح',
    privacyMessage: 'لن تتم مشاركة موقعك الدقيق إلا مع السائق المعيّن لهذه الرحلة.',
    rideRequested: 'تم طلب الرحلة',
    viewTrip: 'عرض الرحلة',
    locationPermissionNeeded: 'نحتاج إذن الموقع',
    allowLocation: 'اسمح بالوصول إلى موقعك لاستخدام نقطة الانطلاق الحالية.',
    pickupLocated: 'تم تحديد نقطة الانطلاق',
    locationUnavailable: 'الموقع غير متاح',
    yourRides: 'رحلاتك',
    journal: 'سجل مسار',
    nextRoute: 'رحلتك القادمة تبدأ من هنا',
    nextRouteDescription: 'احجز مقعدًا لرحلتك القادمة من جرش إلى عمّان وستظهر هنا.',
    yourSpace: 'مساحتك',
    preferences: 'التفضيلات',
    language: 'اللغة',
    notifications: 'الإشعارات',
    safetyPrivacy: 'الأمان والخصوصية',
    protected: 'محمي',
    passengerMode: 'وضع الراكب · نسخة تجريبية',
    intercityCare: 'تنقّل بين المدن، بمشاركة واهتمام.',
    riderPricing: 'تسعير السائق',
    riderPricingDescription: 'حدّد سعر المقعد وأضف خصومات اختيارية للحجوزات الجماعية.',
    baseSeatPrice: 'سعر المقعد',
    discountThreeSeats: 'خصم 3 مقاعد',
    discountFourSeats: 'خصم 4 مقاعد',
    pricingPreview: 'معاينة الأسعار',
    discount: 'خصم',
    wholeCar: 'السيارة كاملة',
    pricingRule: 'كلما زاد عدد المقاعد زادت التكلفة. الخصم يقلّل السعر العادي فقط.',
    languageEnglish: 'English',
    languageArabic: 'العربية',
    // Auth & Onboarding
    welcomeToMassar: 'أهلاً بك في مسار',
    welcomeSubtitle: 'منصتك الذكية للتنقل اليومي المشترك بين محافظات المملكة.',
    passengerRole: 'الراكب',
    passengerRoleDesc: 'احجز مقعدك وتنقل بكل راحة وسرعة وتسعيرة عادلة.',
    captainRole: 'الكابتن (السائق)',
    captainRoleDesc: 'سجّل مركبتك وشارك المقاعد الفارغة وحقق دخلاً موثوقاً.',
    chooseAccountType: 'كيف تود المتابعة اليوم؟',
    continueButton: 'متابعة',
    passengerLoginTitle: 'تسجيل دخول الراكب',
    passengerLoginSub: 'سجّل دخولك لمتابعة وحجز رحلاتك بين المحافظات.',
    captainLoginTitle: 'تسجيل دخول الكابتن',
    captainLoginSub: 'سجّل دخولك لبدء إدارة رحلاتك واستقبال الركاب.',
    passengerRegisterTitle: 'إنشاء حساب راكب جديد',
    passengerRegisterSub: 'انضم إلى مسار واستمتع برحلات مريحة وآمنة.',
    captainRegisterTitle: 'إنشاء حساب كابتن جديد',
    captainRegisterSub: 'انضم لأسطول كباتن مسار المعتمدين وحقق أرباحاً إضافية.',
    phoneNumber: 'رقم الهاتف',
    phonePlaceholder: '07XXXXXXXX',
    password: 'كلمة المرور',
    passwordPlaceholder: 'أدخل كلمة المرور',
    passwordRegisterPlaceholder: 'أنشئ كلمة مرور قوية (6 خانات على الأقل)',
    fullName: 'الاسم الكامل',
    fullNamePlaceholder: 'مثال: أحمد الخطيب',
    logIn: 'تسجيل الدخول',
    signUp: 'إنشاء الحساب',
    dontHaveAccount: 'ليس لديك حساب؟',
    alreadyHaveAccount: 'لديك حساب بالفعل؟',
    signUpPassenger: 'إنشاء حساب راكب',
    signUpCaptain: 'إنشاء حساب كابتن',
    switchToCaptain: 'الدخول ككابتن',
    switchToPassenger: 'الدخول كراكب',
    areYouCaptain: 'هل أنت كابتن؟',
    areYouPassenger: 'هل أنت راكب؟',
    enterPhoneAndPassword: 'يرجى إدخال رقم الهاتف وكلمة المرور',
    fillAllFields: 'يرجى ملء جميع الحقول المطلوبة',
    loginFailed: 'فشل تسجيل الدخول',
    registrationFailed: 'فشل إنشاء الحساب',
    invalidCredentials: 'بيانات الدخول غير صحيحة، يرجى التأكد من الرقم وكلمة المرور.',
    back: 'رجوع',
    logout: 'تسجيل الخروج',
    confirmLogout: 'هل أنت متأكد من رغبتك في تسجيل الخروج؟',
    cancel: 'إلغاء',
    switchLanguage: 'تغيير اللغة',
    adminArea: 'منطقة الإدارة',
    adminDashboard: 'لوحة التحكم الإدارية',
    jordan: 'الأردن',
    fastSafeReliable: 'سريع · آمن · تسعيرة عادلة',
    verifiedFleet: 'أسطول موثّق',
  },
};

const STORAGE_KEY = '@massar/language';

/**
 * Detects the phone's native locale/language preferences.
 * Checks expo-localization, Intl, and React Native NativeModules in order.
 */
export function getDeviceDefaultLanguage(): Language {
  // 1. Try expo-localization
  try {
    const Localization = require('expo-localization');
    const locales = Localization.getLocales?.();
    if (locales && locales.length > 0) {
      const code = locales[0].languageCode?.toLowerCase();
      if (code && code.startsWith('ar')) return 'ar';
      if (code && code.startsWith('en')) return 'en';
    }
  } catch {
    // Ignore and proceed to next check
  }

  // 2. Try Intl (Standard in Hermes / React Native engine)
  try {
    if (typeof Intl !== 'undefined' && Intl.DateTimeFormat) {
      const locale = Intl.DateTimeFormat().resolvedOptions().locale.toLowerCase();
      if (locale.startsWith('ar')) return 'ar';
      if (locale.startsWith('en')) return 'en';
    }
  } catch {
    // Ignore and proceed to next check
  }

  // 3. Try NativeModules (I18nManager / SettingsManager)
  try {
    const deviceLocale =
      Platform.OS === 'ios'
        ? NativeModules?.SettingsManager?.settings?.AppleLocale ||
          NativeModules?.SettingsManager?.settings?.AppleLanguages?.[0]
        : NativeModules?.I18nManager?.localeIdentifier;

    if (typeof deviceLocale === 'string') {
      const lower = deviceLocale.toLowerCase();
      if (lower.startsWith('ar')) return 'ar';
      if (lower.startsWith('en')) return 'en';
    }
  } catch {
    // Fallback
  }

  return 'ar'; // Default fallback for Jordan/Massar if undetectable
}

type LanguageContextValue = {
  language: Language;
  isRTL: boolean;
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void;
  t: (key: TranslationKey | string) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Initialize with device's system preference first
  const [language, setLanguageState] = useState<Language>(() => getDeviceDefaultLanguage());

  useEffect(() => {
    // Check if user has explicitly saved a preference in AsyncStorage
    AsyncStorage.getItem(STORAGE_KEY)
      .then((saved) => {
        if (saved === 'en' || saved === 'ar') {
          setLanguageState(saved);
        } else {
          // No saved preference -> adhere strictly to the phone's preference
          const detected = getDeviceDefaultLanguage();
          setLanguageState(detected);
        }
      })
      .catch(() => {});
  }, []);

  const setLanguage = (nextLanguage: Language) => {
    setLanguageState(nextLanguage);
    void AsyncStorage.setItem(STORAGE_KEY, nextLanguage);
    try {
      I18nManager.allowRTL(nextLanguage === 'ar');
    } catch {
      // Ignore
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  const value = useMemo(
    () => ({
      language,
      isRTL: language === 'ar',
      setLanguage,
      toggleLanguage,
      t: (key: TranslationKey | string) => {
        const langDict = translations[language] as Record<string, string>;
        if (langDict && langDict[key]) return langDict[key];
        const enDict = translations.en as Record<string, string>;
        if (enDict && enDict[key]) return enDict[key];
        return key;
      },
    }),
    [language],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used inside LanguageProvider');
  return context;
}