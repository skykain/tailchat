import React, { useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { generateInjectedScript } from './lib/inject';
import { handleTailchatMessage } from './lib/inject/message-handler';

/**
 * Tailchat的主要内容
 *
 * 由webview提供
 */

interface Props {
  host: string;
}
export const AppMain: React.FC<Props> = React.memo((props) => {
  const webviewRef = useRef<WebView>(null);

  return (
    <View style={styles.root}>
      <WebView
        ref={webviewRef}
        source={{ uri: props.host }}
        mediaPlaybackRequiresUserAction={false}
        injectedJavaScriptBeforeContentLoaded={generateInjectedScript()}
        onMessage={(e) => {
          if (!webviewRef.current) {
            return;
          }

          try {
            const raw = e.nativeEvent.data as string;
            const data = JSON.parse(raw);
            if (typeof data === 'object' && data._isTailchat === true) {
              handleTailchatMessage(
                data.type,
                data.payload,
                webviewRef.current
              );
            }
          } catch (err) {
            console.error('webview onmessage:', err);
          }
        }}
      />
    </View>
  );
});
AppMain.displayName = 'AppMain';

const styles = StyleSheet.create({
  root: {
    height: '100%',
  },
});
