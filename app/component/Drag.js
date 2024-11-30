  import React, { useEffect, useState } from 'react';
  import {
    View,
    FlatList,
    StyleSheet,
    Text,
    Image,
    ActivityIndicator,
    Dimensions, Button
  } from 'react-native' 
  import Draggable from 'react-native-draggable';



  const Drag = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    const image = require('./../../assets/images/react-logo.png') 
    // Fetch data from API
    const fetchNews = async () => {
      try {
        const response = await fetch('https://fakenews.squirro.com/news/sport'); // Replace with your API URL
        const data = await response.json();
        setItems(data.news); // Assuming the response contains a "news" array
      } catch (error) {
        console.error('Error fetching news:', error);
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      fetchNews();
    }, []);

    const renderItem = ({ item }) => (
      <Draggable
      x={0} // Initial x-position
      y={items.findIndex(item_ => item_.id === item.id) * 160} // Initial y-position
    >
        <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        height: 110,
        padding: 10,
        backgroundColor:'white',
        borderRadius:'7px'
      }}
    >
      <Image
        source={image}
        style={{ height: 50, width: 50, borderRadius: 4 }}
      />
      <View style={{ marginLeft: 10 , width:'100%' }}>
        <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 4, width:'83%' }}>
          {item.headline.slice(0,130)}...
        </Text>
        <Text style={{ fontSize: 12, color: 'gray' }}>{item.author}</Text>
      </View>
    </View>
      </Draggable>
    );

    return (


      <>




      <View style={styles.container}>
        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          <FlatList
            data={items}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            numColumns={3} // Adjust number of columns
            contentContainerStyle={styles.list}
          />
        )}
      </View>

      </>
    );
  };


  const { width } = Dimensions.get('window');
  const ITEM_WIDTH = width - 60;

  const styles = StyleSheet.create({
    container: {
      // flex: 1, 
      backgroundColor: '#f5f5f5',
    },
    list: {
      height:'800px',
    width:'400px', 
      padding: 10,
    },
    itemContainer: {
      width: ITEM_WIDTH,
      height: 150,
      margin: 10,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#fff',
      borderRadius: 10,
      elevation: 3,
    },
    image: {
      width: 80,
      height: 80,
      marginBottom: 10,
    },
    text: {
      fontSize: 14,
      fontWeight: 'bold',
      textAlign: 'center',
    },
  });

  export default Drag;
