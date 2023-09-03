// @flow

import { BottomSheetModal } from '@gorhom/bottom-sheet';
import * as React from 'react';

import BottomSheetBackdrop from './bottom-sheet-backdrop.react.js';
import BottomSheetHandle from './bottom-sheet-handle.react.js';
import { useStyles } from '../themes/colors.js';

type Props = {
  +children: React.Node,
  +onClosed: () => mixed,
};

function ForwardedBottomSheet(
  props: Props,
  ref: React.Ref<typeof BottomSheetModal>,
): React.Node {
  const { children, onClosed } = props;

  const styles = useStyles(unboundStyles);

  const snapPoints = React.useMemo(() => ['25%', '50%'], []);

  const onChange = React.useCallback(
    (index: number) => {
      if (index === -1) {
        onClosed();
      }
    },
    [onClosed],
  );

  return (
    <BottomSheetModal
      ref={ref}
      backgroundStyle={styles.background}
      snapPoints={snapPoints}
      handleComponent={BottomSheetHandle}
      backdropComponent={BottomSheetBackdrop}
      onChange={onChange}
    >
      {children}
    </BottomSheetModal>
  );
}

const unboundStyles = {
  background: {
    backgroundColor: 'modalForeground',
  },
};

const BottomSheet: React.AbstractComponent<
  Props,
  React.ElementRef<typeof BottomSheetModal>,
> = React.forwardRef<Props, React.ElementRef<typeof BottomSheetModal>>(
  ForwardedBottomSheet,
);
BottomSheet.displayName = 'BottomSheet';

const MemoizedBottomSheet: typeof BottomSheet = React.memo<
  Props,
  React.ElementRef<typeof BottomSheetModal>,
>(BottomSheet);

export default MemoizedBottomSheet;