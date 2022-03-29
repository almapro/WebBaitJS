export const ar = {
  changeMode: 'تبديل بين وضع الليل و النهار',
  changeLanguage: 'تغيير اللغة إلى الإتجليزية',
  showSidebar: 'عرض قائمة الصفحات',
  titles: {
    login: 'تسجيل الدخول',
    dashboard: 'لوحة التحكم',
    users: 'المستخدمين',
    charts: {
      agents_per_month: 'عدد الضحايا في الشهر',
      agents_by_country: 'عدد الضحايا حسب الدولة',
      agents_by_site: 'عدد الضحايا حسب الموقع',
    }
  },
  descriptions: {
    login: '',
    dashboard: 'عرض الإحصائيات',
    users: 'قائمة المستخدمين',
  },
  inputs: {
    username: 'إسم المستخدم',
    password: 'كلمة المرور',
    role: 'دور المستخدم'
  },
  actions: {
    login: {
      errors: {
        title: 'فشل تسجيل الدخول',
        invalid: 'إسم المستخدم أو كلمة المرور غير صحيحة',
        timeout: 'تأخر الرد من الخادم',
      },
      success: {
        loggedIn: 'تم تسجيل الدخول بنجاح',
      },
      login: 'تسجيل الدخول',
    },
    logout: {
      errors: {
        title: 'فشل تسجيل الخروج',
        invalid: 'فشل تسجيل الخروج, تأكد من أنك مسجل الدخول أو أعد تحميل الصفحة',
        timeout: 'تأخر الرد من الخادم',
      },
      success: {
        loggedOut: 'تم تسجيل الخروج بنجاح',
      },
      logout: 'تسجيل الخروج',
    },
  }
};
