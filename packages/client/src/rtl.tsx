import React, { ReactNode } from "react";
import rtlPlugin from 'stylis-plugin-rtl';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { useTranslation } from 'react-i18next';

const cacheRtl = createCache({
  key: 'muirtl',
  stylisPlugins: [rtlPlugin],
});

const cacheLtr = createCache({
  key: 'muiltr',
});

export const RTL: React.FC<{ children?: ReactNode }> = (props) => {
  const { i18n } = useTranslation();
  return (
    <CacheProvider value={i18n.language === 'en' ? cacheLtr : cacheRtl}>
      {props.children}
    </CacheProvider>
  );
}
