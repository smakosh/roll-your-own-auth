import { useRouter } from "next/router";
import { useConfig } from "nextra-theme-docs";

export default {
  head: () => {
    const { asPath, defaultLocale, locale } = useRouter();
    const { frontMatter } = useConfig();
    const url =
      "https://roll-your-own-auth.smakosh.com" +
      (defaultLocale === locale ? asPath : `/${locale}${asPath}`);

    return (
      <>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta property="og:url" content={url} />
        <meta
          property="og:image"
          content="https://roll-your-own-auth.smakosh.com/og-image.png"
        />
        <meta
          property="og:title"
          content={frontMatter.title || "Roll Your Own Auth"}
        />
        <meta
          property="og:description"
          content={
            frontMatter.description ||
            "Skip the risks of third-party auth. Get started with a simple, secure, and self-hosted authentication system"
          }
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={frontMatter.title || "Roll Your Own Auth"} />
        <meta name="twitter:description" content={
          frontMatter.description ||
          "Skip the risks of third-party auth. Get started with a simple, secure, and self-hosted authentication system"
        } />
        <meta name="twitter:image" content="https://roll-your-own-auth.smakosh.com/og-image.png" />
        <meta name="twitter:url" content={url} />
      </>
    );
  },
  logo: <span>Roll your own Auth</span>,
  project: {
    link: "https://github.com/smakosh/roll-your-own-auth",
  },
  docsRepositoryBase:
    "https://github.com/smakosh/roll-your-own-auth/tree/main/apps/docs",
  useNextSeoProps() {
    const { asPath } = useRouter();
    if (asPath !== "/") {
      return {
        titleTemplate: "%s – Ryo-auth",
      };
    }
  },
};
