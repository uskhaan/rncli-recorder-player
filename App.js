import React, {useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  SafeAreaView,
  TouchableOpacity,
  PermissionsAndroid,
  Platform,
  Dimensions,
  Button,
} from 'react-native';
import AudioRecorderPlayer, {
  AVEncoderAudioQualityIOSType,
  AVEncodingOption,
  AudioEncoderAndroidType,
  AudioSet,
  AudioSourceAndroidType,
  PlayBackType,
  RecordBackType,
} from 'react-native-audio-recorder-player';
import RNFetchBlob from 'rn-fetch-blob';
import Slider from '@react-native-community/slider';

let dirs = RNFetchBlob.fs.dirs;
const path = Platform.select({
  ios: 'hello.m4a',
  android: dirs,
});

const screenWidth = Dimensions.get('screen').width;

export default function App() {
  const [duration, setDuration] = useState('00:00:00');
  const [playTime, setPlayTime] = useState('00:00:00');
  const [recordTime, setRecordTime] = useState('00:00:00');
  const [percent, setPercent] = useState(0);
  const [recordSecs, setRecordSecs] = useState(0);
  const [currentPositionSec, setCurrentPositionSec] = useState(0);
  const [currentDurationSec, setCurrentDurationSec] = useState(0);
  const [audioRecorderPlayer] = useState(new AudioRecorderPlayer());

  const changeTime = async seconds => {
    // 50 / duration
    let seektime = (seconds / 100) * currentDurationSec;
    audioRecorderPlayer.seekToPlayer(seektime);
  };
  let playWidth =
    (currentPositionSec / currentDurationSec) * (screenWidth - 56);

  if (!playWidth) {
    playWidth = 0;
  }

  const onStartRecord = async e => {
    if (Platform.OS === 'android') {
      try {
        const grants = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        ]);

        console.log('write external stroage', grants);

        if (
          grants['android.permission.WRITE_EXTERNAL_STORAGE'] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          grants['android.permission.READ_EXTERNAL_STORAGE'] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          grants['android.permission.RECORD_AUDIO'] ===
            PermissionsAndroid.RESULTS.GRANTED
        ) {
          console.log('permissions granted');
        } else {
          console.log('All required permissions not granted');
          return;
        }
      } catch (err) {
        console.warn(err);
        return;
      }
    }

    const audioSet: AudioSet = {
      AudioEncoderAndroid: AudioEncoderAndroidType.AAC,
      AudioSourceAndroid: AudioSourceAndroidType.MIC,
      AVEncoderAudioQualityKeyIOS: AVEncoderAudioQualityIOSType.high,
      AVNumberOfChannelsKeyIOS: 2,
      AVFormatIDKeyIOS: AVEncodingOption.aac,
    };

    console.log('audioSet', audioSet);

    const uri = await audioRecorderPlayer.startRecorder(undefined, audioSet);

    audioRecorderPlayer.addRecordBackListener(async e => {
      console.log('record-back', e);
      setRecordSecs(e.currentPosition);
      setRecordTime(audioRecorderPlayer.mmssss(Math.floor(e.currentPosition)));
    });
    console.log(`uri: ${uri}`);
  };

  const onStopRecord = async () => {
    const result = audioRecorderPlayer.stopRecorder();
    audioRecorderPlayer.removeRecordBackListener();
    setRecordSecs(0);
  };

  const onStartPlay = async () => {
    const msg = audioRecorderPlayer.startPlayer();
    const volume = audioRecorderPlayer.setVolume(1.0);

    audioRecorderPlayer.addPlayBackListener(async e => {
      let percent = Math.round(
        (Math.floor(e.currentPosition) / Math.floor(e.duration)) * 100,
      );
      setPercent(percent);
      setCurrentPositionSec(e.currentPosition);
      setCurrentDurationSec(e.duration);
      setPlayTime(audioRecorderPlayer.mmssss(Math.floor(e.currentPosition)));

      setDuration(audioRecorderPlayer.mmssss(Math.floor(e.duration)));
    });
  };

  const onStopPlay = async () => {
    console.log('onStopPlay');
    audioRecorderPlayer.stopPlayer();
    audioRecorderPlayer.removePlayBackListener();
  };

  return (
    <View style={styles.screen}>
      <View
        style={{
          flex: 1,
          backgroundColor: '#202020',
          justifyContent: 'center',
          borderRadius: 20,
        }}>
        <Text
          style={{
            color: 'red',
            fontWeight: 'bold',
            fontSize: 30,
            fontFamily: 'Cochin',
            textAlign: 'center',
          }}>
          {recordTime}
        </Text>
      </View>

      <View
        style={{
          flexDirection: 'row',
          borderRadius: 20,
          backgroundColor: '#303030',
          flex: 1,
        }}>
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <TouchableOpacity
            style={styles.recordButton}
            onPress={() => {
              onStartRecord();
            }}>
            <Text style={styles.buttonText}>record</Text>
          </TouchableOpacity>
        </View>

        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <TouchableOpacity
            style={styles.stopButton}
            onPress={() => {
              onStopRecord();
            }}>
            <Text style={styles.buttonText}>Stop</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View
        style={{
          flexDirection: 'row',
          borderRadius: 20,
          backgroundColor: '#404040',
          flex: 1,
        }}>
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <TouchableOpacity
            style={styles.playButton}
            onPress={() => {
              onStartPlay();
            }}>
            <Text style={styles.buttonText}>play</Text>
          </TouchableOpacity>
        </View>

        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <TouchableOpacity
            style={styles.stopPlay}
            onPress={() => {
              onStopPlay();
            }}>
            <Text style={styles.buttonText}>s-play</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View
        style={{
          flex: 1,
          backgroundColor: '#505050',
          borderRadius: 20,
          justifyContent: 'center',
        }}>
        <Slider
          minimumValue={0}
          maximumValue={100}
          trackStyle={''}
          thumbStyle={''}
          value={percent}
          minimumTrackTintColor="#93A8B3"
          onValueChange={seconds => changeTime(seconds)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#909090',
  },
  recordButton: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    borderRadius: 100,
    backgroundColor: 'red',
  },
  stopButton: {
    borderRadius: 10,
    width: 80,
    height: 80,
    backgroundColor: 'steelblue',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
    alignSelf: 'center',
    textTransform: 'uppercase',
  },

  playButton: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 50,
    borderRightWidth: 50,
    borderBottomWidth: 50,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'green',
    transform: [{rotate: '90deg'}],
    justifyContent: 'center',
  },
  stopPlay: {
    width: 50,
    height: 50,
    borderRadius: 50,
    backgroundColor: 'powderblue',
    transform: [{scaleX: 2}],
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#EAEAEC',
  },
  textLight: {
    color: '#B6B7BF',
  },
  text: {
    color: '#8E97A6',
  },
  titleContainer: {alignItems: 'center', marginTop: 24},
  textDark: {
    color: '#3D425C',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  coverContainer: {
    marginTop: 32,
    width: 250,
    height: 250,
    shadowColor: '#5D3F6A',
    shadowOffset: {height: 15},
    shadowRadius: 8,
    shadowOpacity: 0.3,
  },
  cover: {
    width: 250,
    height: 250,
    borderRadius: 125,
  },
  track: {
    height: 2,
    borderRadius: 1,
    backgroundColor: '#FFF',
  },
  thumb: {
    width: 8,
    height: 8,
    backgroundColor: '#3D425C',
  },
  timeStamp: {
    fontSize: 11,
    fontWeight: '500',
  },
  seekbar: {margin: 32},
  inprogress: {
    marginTop: -12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  trackname: {alignItems: 'center', marginTop: 32},
});
