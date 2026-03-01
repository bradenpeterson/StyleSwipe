import { StyleSheet } from 'react-native';
import { Chip } from '../ui/Chip';

/**
 * PickerTile — selectable choice used across onboarding pickers.
 */
export function PickerTile({ label, selected, onPress }) {
  return (
    <Chip
      label={label}
      selected={selected}
      onPress={onPress}
      style={styles.tile}
      tone="accent"
    />
  );
}

const styles = StyleSheet.create({
  tile: {
    margin: 4,
  },
});
