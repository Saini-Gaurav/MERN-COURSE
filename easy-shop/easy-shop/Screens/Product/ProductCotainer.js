import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  ActivityIndicator,
  FlatList,
} from "react-native";

import data from "../../assets/data/products.json";

const ProductContainer = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    setProducts(data);

    return () => {
      setProducts([]);
    };
  }, []);

  return (
    <View>
      <Text>Product Container</Text>
      <View style={{marginTop: 60}}>
        <FlatList
          horizontal
          data={products}
          renderItem={({ item }) => <Text>{item.brand}</Text>}
          keyExtractor={(item) => item.name}
        />
      </View>
    </View>
  );
};

export default ProductContainer;
