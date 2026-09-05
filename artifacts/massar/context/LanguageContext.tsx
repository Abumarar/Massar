import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type Language = 'en' | 'ar';

type TranslationKey =
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
  | 'languageArabic';

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
  },
};

type LanguageContextValue = {
  language: Language;
  isRTL: boolean;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    void AsyncStorage.getItem('@massar/language').then((saved) => {
      if (saved === 'en' || saved === 'ar') setLanguageState(saved);
    });
  }, []);

  const setLanguage = (nextLanguage: Language) => {
    setLanguageState(nextLanguage);
    void AsyncStorage.setItem('@massar/language', nextLanguage);
  };

  const value = useMemo(
    () => ({
      language,
      isRTL: language === 'ar',
      setLanguage,
      t: (key: TranslationKey) => translations[language][key],
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