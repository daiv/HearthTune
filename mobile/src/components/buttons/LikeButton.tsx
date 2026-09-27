import { isLiked, toggleLike } from '@/services/likeService';
import Entypo from '@expo/vector-icons/Entypo';
import { useEffect, useState } from 'react';
import { TouchableOpacity } from 'react-native';
import { useActiveTrack } from 'react-native-track-player';

const checkIfLiked = async (songId: string): Promise<boolean> => {
  const isSongLiked = await isLiked(songId);
  return isSongLiked;
}
export function LikeButton() {
  const [liked, setLiked] = useState<boolean>(false);
  const [isPending, setIsPending] = useState<boolean>(false);

  const track = useActiveTrack();
  const songId: string = track?.id;

  useEffect(() => {
    if (!songId) return;

    checkIfLiked(songId)
      .then(setLiked)
      .catch(console.error);
  }, [songId]);

  const handleClick = async () => {
    if (!songId || isPending) return;
    const previousState = liked;
    setLiked(!previousState);
    try {
      setIsPending(true);
      const serverState: boolean = await toggleLike(songId);
      setLiked(serverState);
    } catch (error) {
      console.error('Error toggling', error);
      setLiked(previousState);
    } finally {
      setIsPending(false);
    }
  }
  
  return <TouchableOpacity
    onPress={handleClick}
    disabled={isPending}
    style={isPending ? { opacity: 0.5 } : {}}
  >
    <Entypo name={liked ? "heart" : "heart-outlined"} size={24} color="red" />
  </TouchableOpacity>
}