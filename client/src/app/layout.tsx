import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "@mantine/core/styles/baseline.css";
import "@mantine/core/styles/default-css-variables.css";
import "@mantine/core/styles/global.css";

import "@mantine/core/styles/ScrollArea.css";
import "@mantine/core/styles/UnstyledButton.css";
import "@mantine/core/styles/VisuallyHidden.css";
import "@mantine/core/styles/Paper.css";
import "@mantine/core/styles/Popover.css";
import "@mantine/core/styles/CloseButton.css";
import "@mantine/core/styles/Group.css";
import "@mantine/core/styles/Loader.css";
import "@mantine/core/styles/Overlay.css";
import "@mantine/core/styles/ModalBase.css";
import "@mantine/core/styles/Input.css";
import "@mantine/core/styles/InlineInput.css";
import "@mantine/core/styles/Flex.css";
import "@mantine/core/styles/FloatingIndicator.css";
import "@mantine/core/styles/ActionIcon.css";

import "@mantine/core/styles/Affix.css";
import "@mantine/core/styles/Anchor.css";
import "@mantine/core/styles/AppShell.css";
import "@mantine/core/styles/Avatar.css";

import "@mantine/core/styles/Badge.css";
import "@mantine/core/styles/Burger.css";

import "@mantine/core/styles/Button.css"; // unsure

import "@mantine/core/styles/Card.css";
import "@mantine/core/styles/Center.css";
import "@mantine/core/styles/Container.css";

import "@mantine/core/styles/Divider.css";

import "@mantine/core/styles/Image.css";
import "@mantine/core/styles/Menu.css";
import "@mantine/core/styles/NavLink.css";
import "@mantine/core/styles/PasswordInput.css";
import "@mantine/core/styles/SegmentedControl.css";

import "@mantine/core/styles/Combobox.css"; //select
import "@mantine/core/styles/SimpleGrid.css";
import "@mantine/core/styles/Stack.css";
import "@mantine/core/styles/Switch.css";

import "@mantine/core/styles/Table.css";
import "@mantine/core/styles/Text.css";
import "@mantine/core/styles/ThemeIcon.css";
import "@mantine/core/styles/Notification.css";
import "@mantine/core/styles/Title.css";

import "@mantine/dates/styles.css";
import "@mantine/notifications/styles.css";
import "./globals.css";
import { ColorSchemeScript, mantineHtmlProps } from "@mantine/core";
import { Providers } from "./providers";

const inter = Inter({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Event Booking",
  description: "Event booking application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" {...mantineHtmlProps} className={`${inter.variable}`}>
      <head>
        <ColorSchemeScript />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
