-- TEST DATA ONLY. These are not real dentists or clinics.
-- Run after supabase-schema.sql. Delete these rows before sharing the directory publicly.

insert into public.dentists (
  slug,
  clinic_name_en, clinic_name_ar,
  dentist_name_en, dentist_name_ar,
  area_en, area_ar,
  address_en, address_ar,
  description_en, description_ar,
  latitude, longitude,
  services_en, services_ar,
  is_sponsored, is_test, status, verified_at
) values
(
  'test-shorouk-demo',
  'TEST ONLY — Shorouk Demo Listing', 'اختبار فقط — عيادة الشروق التجريبية',
  'Demo Dentist', 'طبيب تجريبي',
  'El Shorouk', 'مدينة الشروق',
  'Demo address — not a real clinic', 'عنوان تجريبي — ليست عيادة حقيقية',
  'TEST RECORD ONLY. This listing is fictional and must not be used to seek care.',
  'بيانات اختبار فقط. هذا الإدراج خيالي ولا يُستخدم للبحث عن رعاية طبية.',
  30.1390, 31.6260,
  array['General dentistry', 'Cleaning'], array['طب الأسنان العام', 'تنظيف الأسنان'],
  true, true, 'published', null
),
(
  'test-new-cairo-demo',
  'TEST ONLY — New Cairo Demo Listing', 'اختبار فقط — عيادة القاهرة الجديدة التجريبية',
  'Demo Dentist', 'طبيب تجريبي',
  'New Cairo', 'القاهرة الجديدة',
  'Demo address — not a real clinic', 'عنوان تجريبي — ليست عيادة حقيقية',
  'TEST RECORD ONLY. This listing is fictional and must not be used to seek care.',
  'بيانات اختبار فقط. هذا الإدراج خيالي ولا يُستخدم للبحث عن رعاية طبية.',
  30.0270, 31.4910,
  array['Gum health', 'Consultations'], array['صحة اللثة', 'استشارات'],
  false, true, 'published', null
),
(
  'test-nasr-city-demo',
  'TEST ONLY — Nasr City Demo Listing', 'اختبار فقط — عيادة مدينة نصر التجريبية',
  'Demo Dentist', 'طبيب تجريبي',
  'Nasr City', 'مدينة نصر',
  'Demo address — not a real clinic', 'عنوان تجريبي — ليست عيادة حقيقية',
  'TEST RECORD ONLY. This listing is fictional and must not be used to seek care.',
  'بيانات اختبار فقط. هذا الإدراج خيالي ولا يُستخدم للبحث عن رعاية طبية.',
  30.0610, 31.3450,
  array['Preventive care', 'Consultations'], array['رعاية وقائية', 'استشارات'],
  false, true, 'published', null
)
on conflict (slug) do update set
  clinic_name_en = excluded.clinic_name_en,
  clinic_name_ar = excluded.clinic_name_ar,
  dentist_name_en = excluded.dentist_name_en,
  dentist_name_ar = excluded.dentist_name_ar,
  area_en = excluded.area_en,
  area_ar = excluded.area_ar,
  address_en = excluded.address_en,
  address_ar = excluded.address_ar,
  description_en = excluded.description_en,
  description_ar = excluded.description_ar,
  latitude = excluded.latitude,
  longitude = excluded.longitude,
  services_en = excluded.services_en,
  services_ar = excluded.services_ar,
  is_sponsored = excluded.is_sponsored,
  is_test = excluded.is_test,
  status = excluded.status,
  verified_at = excluded.verified_at,
  updated_at = now();

-- Run this after testing to remove every demo listing:
-- delete from public.dentists where is_test = true;
