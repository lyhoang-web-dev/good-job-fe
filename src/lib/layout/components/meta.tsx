const APP_NAME = 'good-job';

export const Meta = () => {
  return (
    <>
      <title>Good Job</title>
      <meta content="Employee recognition and rewards" name="description" />

      <meta content={APP_NAME} name="application-name" />
      <meta content="yes" name="apple-mobile-web-app-capable" />
      <meta content="default" name="apple-mobile-web-app-status-bar-style" />
      <meta content={APP_NAME} name="apple-mobile-web-app-title" />
      <meta content="telephone=no" name="format-detection" />
      <meta content="yes" name="mobile-web-app-capable" />
      <meta content="#FFFFFF" name="theme-color" />

      <link href="/favicon.svg" rel="shortcut icon" />
    </>
  );
};
