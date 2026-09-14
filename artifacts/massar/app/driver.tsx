import React, { useMemo, useState } from 'react';
import {
  Alert,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSetupCaptainProfile } from '@workspace/api-client-react';
import { useColors } from '@/hooks/useColors';
import { useLanguage } from '@/context/LanguageContext';

type Step = 'intro' | 'profile' | 'documents' | 'submitted';

type DocumentItem = {
  type: string;
  label: string;
  description: string;
  required: boolean;
  fileName?: string;
  fileUri?: string;
};

const initialDocuments: DocumentItem[] = [
  { type: 'driver_license', label: 'Driver licence', description: 'Current licence for the vehicle class.', required: true },
  { type: 'national_id', label: 'National ID', description: 'Identity document for verification.', required: true },
  { type: 'vehicle_registration', label: 'Vehicle registration', description: 'Current vehicle licence and registration.', required: true },
  { type: 'compulsory_insurance', label: 'Compulsory insurance', description: 'Valid insurance for the registered vehicle.', required: true },
  { type: 'vehicle_inspection', label: 'Vehicle inspection', description: 'Current inspection / fitness evidence.', required: true },
  { type: 'ltrc_permit', label: 'LTRC / smart transport permit', description: 'Authorization for the approved transport service.', required: true },
  { type: 'additional_passenger_insurance', label: 'Additional passenger cover', description: 'Additional coverage required for passenger trips.', required: true },
];

export default function DriverOnboardingScreen() {
  const colors = useColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { isRTL } = useLanguage();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const submitApplication = useSetupCaptainProfile();
  const [step, setStep] = useState<Step>('intro');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [nationalIdLast4, setNationalIdLast4] = useState('');
  const [makeModel, setMakeModel] = useState('');
  const [color, setColor] = useState('');
  const [plate, setPlate] = useState('');
  const [seats, setSeats] = useState('4');
  const [documents, setDocuments] = useState<DocumentItem[]>(initialDocuments);
  const [error, setError] = useState<string | null>(null);
  const bottomInset = Platform.OS === 'web' ? 34 : insets.bottom;
  const arabic = isRTL;

  const copy = arabic
    ? {
        eyebrow: 'السائقون · مسار',
        title: 'قد الطريق بثقة',
        intro: 'أرسل بياناتك ووثائقك حتى يراجعها فريق العمليات قبل تفعيلك للرحلات.',
        start: 'ابدأ التسجيل',
        back: 'رجوع',
        profileTitle: 'بياناتك ومركبتك',
        profileDescription: 'نحتاج هذه التفاصيل لمطابقة الحساب مع سجلات المركبة.',
        name: 'الاسم الكامل',
        phone: 'رقم الهاتف',
        id: 'آخر 4 أرقام من الرقم الوطني',
        vehicle: 'المركبة',
        makeModel: 'النوع والموديل',
        color: 'اللون',
        plate: 'رقم اللوحة',
        seats: 'عدد المقاعد',
        next: 'متابعة للوثائق',
        docsTitle: 'وثائق التسجيل',
        docsDescription: 'التقط صورة واضحة لكل وثيقة. هذه قائمة مراجعة تشغيلية وليست بديلاً عن موافقة الجهات المختصة.',
        attach: 'إرفاق صورة',
        attached: 'تم الإرفاق',
        submit: 'إرسال للمراجعة',
        submittedTitle: 'تم إرسال طلبك',
        submittedDescription: 'سيُراجع فريق مسار الوثائق ويتواصل معك عند تحديث الحالة.',
        done: 'العودة إلى الحساب',
        missing: 'أكمل البيانات المطلوبة وأرفق كل الوثائق قبل الإرسال.',
        cameraPermission: 'نحتاج إذن الكاميرا أو الصور لإرفاق الوثائق.',
        uploadError: 'تعذر إرفاق الوثيقة. حاول مرة أخرى.',
      }
    : {
        eyebrow: 'DRIVER · MASSAR',
        title: 'Lead the way with confidence',
        intro: 'Share your details and documents so our operations team can review you before you accept rides.',
        start: 'Start registration',
        back: 'Back',
        profileTitle: 'You and your vehicle',
        profileDescription: 'These details help us match your account to your vehicle records.',
        name: 'Full name',
        phone: 'Phone number',
        id: 'Last 4 digits of national ID',
        vehicle: 'Vehicle',
        makeModel: 'Make and model',
        color: 'Color',
        plate: 'Plate number',
        seats: 'Seats',
        next: 'Continue to documents',
        docsTitle: 'Registration documents',
        docsDescription: 'Capture a clear photo of each document. This is an operational checklist, not a substitute for approval by the competent authorities.',
        attach: 'Attach photo',
        attached: 'Attached',
        submit: 'Submit for review',
        submittedTitle: 'Application submitted',
        submittedDescription: 'Massar operations will review your documents and contact you when your status changes.',
        done: 'Back to profile',
        missing: 'Complete your details and attach every required document before submitting.',
        cameraPermission: 'Camera or photo access is needed to attach documents.',
        uploadError: 'We could not attach that document. Try again.',
      };

  const pickDocument = async (type: string) => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert(arabic ? 'إذن الصور مطلوب' : 'Photo access needed', copy.cameraPermission);
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.78,
        allowsEditing: true,
      });
      if (result.canceled || !result.assets[0]) return;
      const asset = result.assets[0];
      setDocuments((current) =>
        current.map((document) =>
          document.type === type
            ? { ...document, fileUri: asset.uri, fileName: asset.fileName ?? `${type}.jpg` }
            : document,
        ),
      );
    } catch {
      Alert.alert(arabic ? 'تعذر الإرفاق' : 'Attachment failed', copy.uploadError);
    }
  };

  const submit = async () => {
    const attached = documents.filter((document) => document.fileName && document.fileUri);
    if (!fullName.trim() || phone.trim().length < 7 || nationalIdLast4.trim().length !== 4 || !makeModel.trim() || !color.trim() || !plate.trim() || attached.length !== documents.length) {
      setError(copy.missing);
      return;
    }
    setError(null);
    const payload = {
      fullName: fullName.trim(),
      phone: phone.trim(),
      nationalIdLast4: nationalIdLast4.trim(),
      vehicleMakeModel: makeModel.trim(),
      vehicleColor: color.trim(),
      vehiclePlate: plate.trim(),
      totalSeats: Number(seats) || 4,
    };
    try {
      await submitApplication.mutateAsync({ data: payload });
      await AsyncStorage.setItem('@massar/driver-application', JSON.stringify({ ...payload, submittedAt: new Date().toISOString() }));
      setStep('submitted');
    } catch {
      setError(arabic ? 'تعذر إرسال الطلب. تحقق من الاتصال وحاول مرة أخرى.' : 'We could not submit your application. Check your connection and try again.');
    }
  };

  if (step === 'submitted') {
    return (
      <View style={styles.screen}>
        <View style={[styles.submitted, { paddingTop: insets.top + 32, paddingBottom: bottomInset + 24 }]}>
          <View style={styles.successIcon}><Feather name="check" size={30} color={colors.primaryForeground} /></View>
          <Text style={styles.title}>{copy.submittedTitle}</Text>
          <Text style={styles.body}>{copy.submittedDescription}</Text>
          <Pressable onPress={() => router.canGoBack() ? router.back() : router.replace('/')} style={styles.primaryButton}><Text style={styles.primaryButtonText}>{copy.done}</Text><Feather name="arrow-right" size={18} color={colors.primaryForeground} /></Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + 16, paddingBottom: bottomInset + 28 }]} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable onPress={() => (step === 'intro' ? (router.canGoBack() ? router.back() : router.replace('/')) : setStep(step === 'documents' ? 'profile' : 'intro'))} style={styles.iconButton}>
            <Feather name={arabic ? 'arrow-right' : 'arrow-left'} size={20} color={colors.ink} />
          </Pressable>
          <Text style={styles.headerLabel}>{copy.eyebrow}</Text>
          <View style={styles.progress}><View style={[styles.progressFill, { width: step === 'intro' ? '28%' : step === 'profile' ? '58%' : '88%' }]} /></View>
        </View>

        {step === 'intro' && (
          <>
            <View style={styles.hero}>
              <Image source={require('@/assets/images/icon.png')} style={styles.logo} />
              <Text style={styles.heroTitle}>{copy.title}</Text>
              <Text style={styles.body}>{copy.intro}</Text>
            </View>
            <View style={styles.checklistCard}>
              {[
                arabic ? 'رخصة قيادة سارية' : 'Valid driver licence',
                arabic ? 'ترخيص وتسجيل المركبة' : 'Vehicle registration',
                arabic ? 'تأمين وفحص المركبة' : 'Insurance and inspection',
                arabic ? 'موافقة تشغيل نقل الركاب' : 'Passenger transport authorization',
              ].map((item) => (
                <View key={item} style={styles.checklistRow}><View style={styles.checkIcon}><Feather name="check" size={13} color={colors.petrol} /></View><Text style={styles.checkText}>{item}</Text></View>
              ))}
            </View>
            <Pressable onPress={() => setStep('profile')} style={styles.primaryButton}><Text style={styles.primaryButtonText}>{copy.start}</Text><Feather name={arabic ? 'arrow-left' : 'arrow-right'} size={18} color={colors.primaryForeground} /></Pressable>
          </>
        )}

        {step === 'profile' && (
          <>
            <Text style={styles.pageTitle}>{copy.profileTitle}</Text>
            <Text style={styles.body}>{copy.profileDescription}</Text>
            <View style={styles.formCard}>
              <Field label={copy.name} value={fullName} onChangeText={setFullName} placeholder={arabic ? 'مثال: أحمد الخطيب' : 'e.g. Ahmad Al-Khatib'} styles={styles} colors={colors} />
              <Field label={copy.phone} value={phone} onChangeText={setPhone} placeholder="+962 7..." keyboardType="phone-pad" styles={styles} colors={colors} />
              <Field label={copy.id} value={nationalIdLast4} onChangeText={(value) => setNationalIdLast4(value.replace(/\D/g, '').slice(0, 4))} placeholder="0000" keyboardType="number-pad" styles={styles} colors={colors} />
              <Text style={styles.formSection}>{copy.vehicle}</Text>
              <Field label={copy.makeModel} value={makeModel} onChangeText={setMakeModel} placeholder={arabic ? 'تويوتا كورولا 2020' : 'Toyota Corolla 2020'} styles={styles} colors={colors} />
              <View style={styles.fieldRow}><View style={styles.fieldHalf}><Field label={copy.color} value={color} onChangeText={setColor} placeholder={arabic ? 'أبيض' : 'White'} styles={styles} colors={colors} /></View><View style={styles.fieldHalf}><Field label={copy.plate} value={plate} onChangeText={setPlate} placeholder="32-4821" styles={styles} colors={colors} /></View></View>
              <Field label={copy.seats} value={seats} onChangeText={(value) => setSeats(value.replace(/\D/g, '').slice(0, 1))} placeholder="4" keyboardType="number-pad" styles={styles} colors={colors} />
            </View>
            {error && <Text style={styles.error}>{error}</Text>}
            <Pressable onPress={() => setStep('documents')} style={styles.primaryButton}><Text style={styles.primaryButtonText}>{copy.next}</Text><Feather name={arabic ? 'arrow-left' : 'arrow-right'} size={18} color={colors.primaryForeground} /></Pressable>
          </>
        )}

        {step === 'documents' && (
          <>
            <Text style={styles.pageTitle}>{copy.docsTitle}</Text>
            <Text style={styles.body}>{copy.docsDescription}</Text>
            <View style={styles.documentsList}>
              {documents.map((document) => (
                <View key={document.type} style={styles.documentCard}>
                  <View style={styles.documentIcon}><Feather name={document.fileUri ? 'check' : 'file-text'} size={17} color={document.fileUri ? colors.petrol : colors.gold} /></View>
                  <View style={styles.documentCopy}><Text style={styles.documentTitle}>{document.label}</Text><Text style={styles.documentDescription}>{document.fileName ?? document.description}</Text></View>
                  <Pressable onPress={() => void pickDocument(document.type)} style={[styles.attachButton, document.fileUri && styles.attachButtonDone]}><Text style={[styles.attachText, document.fileUri && styles.attachTextDone]}>{document.fileUri ? copy.attached : copy.attach}</Text></Pressable>
                </View>
              ))}
            </View>
            {error && <Text style={styles.error}>{error}</Text>}
            <Pressable disabled={submitApplication.isPending} onPress={() => void submit()} style={[styles.primaryButton, submitApplication.isPending && { opacity: 0.65 }]}><Text style={styles.primaryButtonText}>{submitApplication.isPending ? (arabic ? 'جارٍ الإرسال…' : 'Submitting…') : copy.submit}</Text><Feather name="send" size={17} color={colors.primaryForeground} /></Pressable>
          </>
        )}
      </ScrollView>
    </View>
  );
}

function Field({ label, value, onChangeText, placeholder, keyboardType, styles, colors }: { label: string; value: string; onChangeText: (value: string) => void; placeholder: string; keyboardType?: 'default' | 'phone-pad' | 'number-pad'; styles: ReturnType<typeof createStyles>; colors: ReturnType<typeof useColors> }) {
  return <View style={styles.field}><Text style={styles.fieldLabel}>{label}</Text><TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={colors.mutedForeground} keyboardType={keyboardType} style={styles.input} /></View>;
}

const createStyles = (colors: ReturnType<typeof useColors>) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 18 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  headerLabel: { color: colors.mutedForeground, fontSize: 10, fontWeight: '800', letterSpacing: 1.2, flex: 1 },
  iconButton: { width: 40, height: 40, borderRadius: 13, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' },
  progress: { width: 70, height: 5, backgroundColor: colors.border, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: 5, backgroundColor: colors.gold, borderRadius: 3 },
  hero: { backgroundColor: colors.petrolDark, borderRadius: 24, padding: 22, marginTop: 24 },
  logo: { width: 48, height: 48, borderRadius: 16, marginBottom: 24 },
  heroTitle: { color: '#ffffff', fontSize: 29, lineHeight: 34, fontWeight: '800', letterSpacing: -0.5 },
  title: { color: colors.ink, fontSize: 30, lineHeight: 35, fontWeight: '800', letterSpacing: -0.6, marginTop: 22 },
  pageTitle: { color: colors.ink, fontSize: 28, lineHeight: 33, fontWeight: '800', letterSpacing: -0.6, marginTop: 24 },
  body: { color: colors.mutedForeground, fontSize: 13, lineHeight: 20, marginTop: 9 },
  checklistCard: { backgroundColor: colors.card, borderRadius: 19, borderWidth: 1, borderColor: colors.border, padding: 15, marginTop: 14 },
  checklistRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 9 },
  checkIcon: { width: 25, height: 25, borderRadius: 9, backgroundColor: colors.mint, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  checkText: { color: colors.ink, fontSize: 13, fontWeight: '700' },
  formCard: { backgroundColor: colors.card, borderRadius: 20, borderWidth: 1, borderColor: colors.border, padding: 15, marginTop: 18 },
  field: { marginBottom: 13 },
  fieldRow: { flexDirection: 'row', gap: 10 },
  fieldHalf: { flex: 1 },
  fieldLabel: { color: colors.mutedForeground, fontSize: 10, fontWeight: '800', marginBottom: 6 },
  input: { minHeight: 46, borderRadius: 13, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.background, paddingHorizontal: 12, color: colors.ink, fontSize: 14 },
  formSection: { color: colors.petrol, fontSize: 11, fontWeight: '800', letterSpacing: 0.7, marginTop: 6, marginBottom: 13, textTransform: 'uppercase' },
  primaryButton: { minHeight: 54, borderRadius: 15, backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 16 },
  primaryButtonText: { color: colors.primaryForeground, fontSize: 14, fontWeight: '800' },
  documentsList: { marginTop: 18, gap: 9 },
  documentCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: 17, borderWidth: 1, borderColor: colors.border, padding: 12 },
  documentIcon: { width: 34, height: 34, borderRadius: 11, backgroundColor: colors.mint, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  documentCopy: { flex: 1, paddingRight: 6 },
  documentTitle: { color: colors.ink, fontSize: 12, fontWeight: '800' },
  documentDescription: { color: colors.mutedForeground, fontSize: 10, marginTop: 3 },
  attachButton: { borderRadius: 10, borderWidth: 1, borderColor: colors.gold, paddingHorizontal: 9, paddingVertical: 8 },
  attachButtonDone: { borderColor: colors.petrol, backgroundColor: colors.mint },
  attachText: { color: colors.gold, fontSize: 10, fontWeight: '800' },
  attachTextDone: { color: colors.petrol },
  error: { color: colors.destructive, fontSize: 12, lineHeight: 17, marginTop: 11 },
  submitted: { flex: 1, paddingHorizontal: 22, justifyContent: 'center' },
  successIcon: { width: 62, height: 62, borderRadius: 22, backgroundColor: colors.petrol, alignItems: 'center', justifyContent: 'center' },
});