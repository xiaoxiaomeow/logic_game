import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import enTranslation from "@/locales/en.json";
import zhTranslation from "@/locales/zh.json";

i18n
	.use(LanguageDetector)
	.use(initReactI18next)
	.init({
		debug: true,
		fallbackLng: 'en',
		resources: {
			en: { translation: enTranslation },
			zh: { translation: zhTranslation }
		},
		detection: {
			order: ['localStorage', 'navigator', 'htmlTag', 'path', 'subdomain'],
			convertDetectedLanguage: (lng) => {
				if (lng.startsWith('en')) {
					return 'en';
				}
				if (lng.startsWith('zh')) {
					return 'zh';
				}
				return lng;
			},
		}
	});

export default i18n;