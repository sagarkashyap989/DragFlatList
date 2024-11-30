import React, { useState, useEffect } from 'react';
import {
  Image,
  Platform,
  StatusBar,
  Text,
  useWindowDimensions,
  View, Button

} from 'react-native';
import {
  SafeAreaProvider,
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import Animated, {
  cancelAnimation,
  runOnJS,
  scrollTo,
  useAnimatedGestureHandler,
  useAnimatedReaction,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { PanGestureHandler } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';

// Utility Functions
function clampValue(value, min, max) {
  'worklet';
  return Math.max(min, Math.min(value, max));
}

function shuffleArray(array) {
  let counter = array.length;
  while (counter > 0) {
    let index = Math.floor(Math.random() * counter);
    counter--;
    let temp = array[counter];
    array[counter] = array[index];
    array[index] = temp;
  }
  return array;
}

function reorderPositions(positions, from, to) {
  'worklet';
  const updatedPositions = { ...positions };
  for (const id in positions) {
    if (positions[id] === from) {
      updatedPositions[id] = to;
    }
    if (positions[id] === to) {
      updatedPositions[id] = from;
    }
  }
  return updatedPositions;
}

 

// Constants
const CARD_HEIGHT = 110;
const SCROLL_THRESHOLD = CARD_HEIGHT;

// NewsCard Component
function NewsCard({ author, headline }) {
  const image = require('./../../assets/images/react-logo.png');
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        height: CARD_HEIGHT,
        padding: 10,
      }}
    >
      <Image
        source={image}
        style={{ height: 50, width: 50, borderRadius: 4 }}
      />
      <View style={{ marginLeft: 10 , width:'100%' }}>
        <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 4, width:'83%' }}>
          {headline.slice(0,130)}...
        </Text>
        <Text style={{ fontSize: 12, color: 'gray' }}>{author}</Text>
      </View>
    </View>
  );
}

// DraggableNewsCard Component
function DraggableNewsCard({
  id,
  author,
  headline,
  positions,
  scrollY,
  totalItems,
}) {
  const screenDimensions = useWindowDimensions();
  const safeAreaInsets = useSafeAreaInsets();
  const [isDragging, setIsDragging] = useState(false);
  const topPosition = useSharedValue(positions.value[id] * CARD_HEIGHT);

  useAnimatedReaction(
    () => positions.value[id],
    (currentPosition, previousPosition) => {
      if (currentPosition !== previousPosition && !isDragging) {
        topPosition.value = withSpring(currentPosition * CARD_HEIGHT);
      }
    },
    [isDragging]
  );

  const dragHandler = useAnimatedGestureHandler({
    onStart() {
      runOnJS(setIsDragging)(true);
      if (Platform.OS === 'ios') {
        runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium);
      }
    },
    onActive(event) {
      const positionY = event.absoluteY + scrollY.value;
      const screenHeight = screenDimensions.height - safeAreaInsets.top - safeAreaInsets.bottom;

      if (positionY <= scrollY.value + SCROLL_THRESHOLD) {
        scrollY.value = withTiming(0, { duration: 1500 });
      } else if (
        positionY >= scrollY.value + screenHeight - SCROLL_THRESHOLD
      ) {
        const maxScroll = totalItems * CARD_HEIGHT - screenHeight;
        scrollY.value = withTiming(maxScroll, { duration: 1500 });
      } else {
        cancelAnimation(scrollY);
      }

      topPosition.value = withTiming(positionY - CARD_HEIGHT, { duration: 16 });

      const newPosition = clampValue(
        Math.floor(positionY / CARD_HEIGHT),
        0,
        totalItems - 1
      );

      if (newPosition !== positions.value[id]) {
        positions.value = reorderPositions(
          positions.value,
          positions.value[id],
          newPosition
        );

        if (Platform.OS === 'ios') {
          runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
        }
      }
    },
    onFinish() {
      topPosition.value = positions.value[id] * CARD_HEIGHT;
      runOnJS(setIsDragging)(false);
    },
  });

  const animatedCardStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    left: 0,
    right: 0,
    top: topPosition.value,
    zIndex: isDragging ? 1 : 0,
    shadowColor: 'black',
    shadowOpacity: isDragging ? 0.2 : 0,
    shadowRadius: 10,
  }));

  return (
    <Animated.View style={animatedCardStyle}>
      <BlurView intensity={isDragging ? 100 : 0} tint="light">
        <PanGestureHandler onGestureEvent={dragHandler}>
          <Animated.View>
            <NewsCard author={author} headline={headline} />
          </Animated.View>
        </PanGestureHandler>
      </BlurView>
    </Animated.View>
  );
}

// Drag Component
export default function DragNDrop() {
  const [newsItems, setNewsItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const scrollY = useSharedValue(0);
  const scrollViewRef = useAnimatedRef();
  const positions = useSharedValue({});

  useEffect(() => {
    const fetchNewsData = async () => {
      try {
        const response = await fetch('https://fakenews.squirro.com/news/sport');
        const data = await response.json();
        const news = data.news || [];
        setNewsItems(news);

        const initialPositions = {};
        news.forEach((item, index) => {
          initialPositions[item.headline] = index;
        });
        positions.value = initialPositions;
      } catch (error) {
        console.error('Error fetching news:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNewsData();
  }, []);

  useAnimatedReaction(
    () => scrollY.value,
    (scrollPosition) => scrollTo(scrollViewRef, 0, scrollPosition, false)
  );

  const handleScroll = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  if (isLoading) {
    return (
      <View>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <>




      <StatusBar barStyle="dark-content" />
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1 }}>
          <Animated.ScrollView
            ref={scrollViewRef}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            style={{ flex: 1, backgroundColor: 'white' }}
            contentContainerStyle={{
              height: newsItems.length * CARD_HEIGHT,
            }}
          >
            {newsItems.map((item) => (
              <DraggableNewsCard
                key={item.headline}
                id={item.headline}
                author={item.author || 'Unknown'}
                headline={item.abstract}
                positions={positions}
                scrollY={scrollY}
                totalItems={newsItems.length}
              />
            ))}
          </Animated.ScrollView>
        </SafeAreaView>
      </SafeAreaProvider>
    </>
  );
}
