import React from "react";
import { StyleSheet } from "react-native";
import { TrackScreen } from "../../../analytics";
import CountervalueSettingsRow from "./CountervalueSettingsRow";
import ThemeSettingsRow from "./ThemeSettingsRow";
import AuthSecurityToggle from "./AuthSecurityToggle";
import ReportErrorsRow from "./ReportErrorsRow";
import AnalyticsRow from "./AnalyticsRow";
import CarouselRow from "./CarouselRow";
import LanguageRow from "./LanguageRow";
import NavigationScrollView from "../../../components/NavigationScrollView";

export default function GeneralSettings() {
  return (
    <NavigationScrollView
      contentContainerStyle={styles.root}
      style={{ paddingLeft: 16, paddingRight: 16 }}
    >
      <TrackScreen category="Settings" name="General" />
      <CountervalueSettingsRow />
      <LanguageRow />
      <ThemeSettingsRow />
      <AuthSecurityToggle />
      <ReportErrorsRow />
      <AnalyticsRow />
      <CarouselRow />
    </NavigationScrollView>
  );
}

const styles = StyleSheet.create({
  root: { paddingTop: 16, paddingBottom: 64 },
});
