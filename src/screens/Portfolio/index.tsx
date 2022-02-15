import React, { useRef, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import { StyleSheet, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated from "react-native-reanimated";
import { createNativeWrapper } from "react-native-gesture-handler";
import { Trans, useTranslation } from "react-i18next";
import { useFocusEffect } from "@react-navigation/native";
import { isAccountEmpty } from "@ledgerhq/live-common/lib/account";

import { Box, Flex, Link, Text } from "@ledgerhq/native-ui";

import styled from "styled-components/native";
import {
  useRefreshAccountsOrdering,
  useDistribution,
} from "../../actions/general";
import { accountsSelector } from "../../reducers/accounts";
import { counterValueCurrencySelector } from "../../reducers/settings";
import { usePortfolio } from "../../actions/portfolio";
import globalSyncRefreshControl from "../../components/globalSyncRefreshControl";

import GraphCardContainer from "./GraphCardContainer";
import Carousel from "../../components/Carousel";
import StickyHeader from "./StickyHeader";
import Header from "./Header";
import extraStatusBarPadding from "../../logic/extraStatusBarPadding";
import TrackScreen from "../../analytics/TrackScreen";
import MigrateAccountsBanner from "../MigrateAccounts/Banner";
import RequireTerms from "../../components/RequireTerms";
import { useScrollToTop } from "../../navigation/utils";
import { NavigatorName, ScreenName } from "../../const";
import FabActions from "../../components/FabActions";
import FirmwareUpdateBanner from "../../components/FirmwareUpdateBanner";
import DiscoverSection from "./DiscoverSection";
import AddAssetsCard from "./AddAssetsCard";
import Assets from "./Assets";

export { default as PortfolioTabIcon } from "./TabIcon";

const AnimatedFlatListWithRefreshControl = createNativeWrapper(
  Animated.createAnimatedComponent(globalSyncRefreshControl(FlatList)),
  {
    disallowInterruption: true,
    shouldCancelWhenOutside: false,
  },
);

type Props = {
  navigation: any;
};

const ContentContainer = styled.SafeAreaView`
  flex: 1;
  background-color: ${p => p.theme.colors.palette.background.main};
  padding-top: ${() => extraStatusBarPadding}px;
`;

const SectionTitle = ({
  title,
  onSeeAllPress,
  navigatorName,
  navigation,
}: {
  title: React.ReactElement;
  onSeeAllPress?: () => void;
  navigatorName?: keyof typeof NavigatorName;
  navigation?: any;
}) => {
  const onLinkPress = useCallback(() => {
    if (onSeeAllPress) {
      onSeeAllPress();
    }
    if (navigation && navigatorName) {
      navigation.navigate(navigatorName);
    }
  }, [navigation, onSeeAllPress, navigatorName]);

  return (
    <Flex
      flexDirection={"row"}
      justifyContent={"space-between"}
      alignItems={"center"}
      mb={6}
    >
      <Text variant={"h3"} textTransform={"uppercase"} mt={2}>
        {title}
      </Text>
      {(onSeeAllPress || navigatorName) && (
        <Link onPress={onLinkPress} type={"color"}>
          <Trans i18nKey={"common.seeAll"} />
        </Link>
      )}
    </Flex>
  );
};

export default function PortfolioScreen({ navigation }: Props) {
  const accounts = useSelector(accountsSelector);
  const counterValueCurrency = useSelector(counterValueCurrencySelector);
  const portfolio = usePortfolio();
  const { t } = useTranslation();

  const refreshAccountsOrdering = useRefreshAccountsOrdering();
  useFocusEffect(refreshAccountsOrdering);

  const scrollY = useRef(new Animated.Value(0)).current;
  const ref = useRef();
  useScrollToTop(ref);

  const areAccountsEmpty = useMemo(() => accounts.every(isAccountEmpty), [
    accounts,
  ]);

  const flatListRef = useRef();
  let distribution = useDistribution();
  const maxDistributionToDisplay = 3;
  distribution = {
    ...distribution,
    list: distribution.list.slice(0, maxDistributionToDisplay),
  };

  const showAssets = accounts.length > 0;

  const maxAssetsToDisplay = 3;
  const assetsToDisplay = accounts.slice(0, maxAssetsToDisplay);

  const onDistributionButtonPress = useCallback(() => {
    navigation.navigate(ScreenName.Distribution);
  }, [navigation]);

  const onDistributionCardPress = useCallback(
    (i, item) =>
      navigation.navigate(ScreenName.Asset, {
        currency: item.currency,
      }),
    [navigation],
  );

  const onAnalytics = useCallback(() => {
    navigation.navigate(NavigatorName.Analytics);
  }, [navigation]);

  const data = useMemo(
    () => [
      <Box bg={"background.main"} mx={6} py={6}>
        <Header />
      </Box>,
      !accounts.length && (
        <Box mx={6} mt={3}>
          <AddAssetsCard />
        </Box>
      ),
      <Box mx={6} mt={3}>
        <GraphCardContainer
          counterValueCurrency={counterValueCurrency}
          portfolio={portfolio}
          showGreeting={!areAccountsEmpty}
          showGraphCard={!areAccountsEmpty}
          onAnalytics={onAnalytics}
        />
      </Box>,
      accounts.length > 0 && (
        <Box mx={6} mt={6}>
          <FabActions />
        </Box>
      ),
      ...(showAssets
        ? [
            <Flex mx={6} mt={10}>
              <SectionTitle
                title={<Trans i18nKey={"v3.distribution.title"} />}
                navigation={navigation}
                navigatorName={NavigatorName.Accounts}
              />
              <Assets balanceHistory={portfolio.balanceHistory} flatListRef={flatListRef} assets={assetsToDisplay} />
            </Flex>,
          ]
        : []),
      <Flex mx={6} mt={10}>
        <SectionTitle
          title={<Trans i18nKey={"tabs.platform"} />}
          navigation={navigation}
          navigatorName={NavigatorName.Platform}
        />
        <DiscoverSection />
      </Flex>,
      <Flex mx={6} mt={10}>
        <SectionTitle
          title={<Trans i18nKey={"v3.portfolio.recommanded.title"} />}
        />
        <Carousel />
      </Flex>,
    ],
    [
      accounts.length,
      areAccountsEmpty,
      assetsToDisplay,
      counterValueCurrency,
      navigation,
      onAnalytics,
      portfolio,
      showAssets,
    ],
  );

  return (
    <>
      <FirmwareUpdateBanner />
      <ContentContainer>
        <RequireTerms />

        <TrackScreen category="Portfolio" accountsLength={accounts.length} />

        <AnimatedFlatListWithRefreshControl
          ref={ref}
          data={data}
          style={styles.inner}
          renderItem={({ item }) => item}
          keyExtractor={(item, index) => String(index)}
          showsVerticalScrollIndicator={false}
          stickyHeaderIndices={[0]}
          onScroll={Animated.event(
            [
              {
                nativeEvent: {
                  contentOffset: { y: scrollY },
                },
              },
            ],
            { useNativeDriver: true },
          )}
          testID={
            accounts.length ? "PortfolioAccountsList" : "PortfolioEmptyAccount"
          }
        />
        <MigrateAccountsBanner />
      </ContentContainer>
    </>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  inner: {
    position: "relative",
    flex: 1,
  },
  distrib: {
    marginTop: -56,
  },
  list: {
    flex: 1,
  },
  distributionTitle: {
    fontSize: 16,
    lineHeight: 24,
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  stickyActions: {
    height: 110,
    width: "100%",
    alignContent: "flex-start",
    justifyContent: "flex-start",
  },
  styckyActionsInner: { height: 56 },
  seeMoreBtn: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 32,
  },
});
