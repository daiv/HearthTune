import Entypo from '@expo/vector-icons/Entypo';
import { useState } from 'react';
import { TouchableOpacity } from 'react-native';
import { useActiveTrack } from 'react-native-track-player';

export function LikeButton() {
  const [liked, setLiked] = useState(false);

  return <TouchableOpacity
    onPress={() => setLiked(liked => !liked)}
  >
    <Entypo name={liked ? "heart" : "heart-outlined"} size={24} color="red" />
  </TouchableOpacity>
}