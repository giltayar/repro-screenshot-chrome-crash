FROM ubuntu:bionic
# COPIED FROM: https://github.com/yukinying/chrome-headless-browser-docker/blob/master/LICENSE

ARG DEBIAN_FRONTEND=noninteractive
ARG RANDOM_BUILD_ARG=122
ENV RANDOM_ENV_TO_FORCE_BUILD=${RANDOM_BUILD_ARG}

RUN apt-get update -qqy \
  && apt-get -qqy install \
      gnupg wget ca-certificates apt-transport-https \
      ttf-wqy-zenhei \
      culmus \
      libfontconfig \
      libfreetype6 \
      xfonts-cyrillic \
      xfonts-scalable \
      fonts-liberation \
      fonts-ipafont-gothic \
      ttf-ubuntu-font-family \
      fonts-dejavu \
      fonts-noto \
      fonts-noto-color-emoji

RUN wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | apt-key add - \
  && echo "deb https://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google-chrome.list \
  && apt-get update -qqy \
  && apt-get -qqy install google-chrome-stable \
  && rm /etc/apt/sources.list.d/google-chrome.list \
  && rm -rf /var/lib/apt/lists/* /var/cache/apt/*

COPY local.conf /etc/fonts/conf.d/99-local.conf
RUN fc-cache -f -v

RUN useradd headless --shell /bin/bash --create-home \
  && usermod -a -G sudo headless \
  && echo 'ALL ALL = (ALL) NOPASSWD: ALL' >> /etc/sudoers \
  && echo 'headless:nopassword' | chpasswd

RUN mkdir /data && chown -R headless:headless /data

RUN echo Version of Chrome is... `/usr/bin/google-chrome-stable --version`

EXPOSE 9222

USER headless

RUN echo \
    ' *************************************\n' \
    '*** The Chrome version is now:' `/usr/bin/google-chrome-stable --version` '***\n' \
    '*************************************\n'

ENTRYPOINT ["/usr/bin/google-chrome-stable", \
\
            "--headless", \
            "--disable-background-networking", \
            "--disable-background-timer-throttling", \
            "--disable-client-side-phishing-detection", \
            "--disable-default-apps", \
            "--disable-extensions", \
            "--disable-hang-monitor", \
            "--disable-popup-blocking", \
            "--disable-prompt-on-repost", \
            "--disable-sync", \
            "--disable-translate", \
            "--metrics-recording-only", \
            "--no-first-run", \
            "--remote-debugging-port=0", \
            "--safebrowsing-disable-auto-update", \
            "--enable-automation", \
            "--password-store=basic", \
            "--use-mock-keychain", \
            "--disable-gpu", \
            "--headless", \
            "--hide-scrollbars", \
            "--mute-audio", \
            "--no-sandbox", \
            # See https://bugs.chromium.org/p/chromium/issues/detail?id=736452 for an explanation of `disable-dev-shm-usage`
            "--disable-dev-shm-usage", \
\
            "--window-size=1024,768", \
\
            "--remote-debugging-address=0.0.0.0", \
            "--remote-debugging-port=9222", \
            "--user-data-dir=/data"]
