import { Component } from '@angular/core';
import { AudioConfig, ResultReason, SpeechConfig, SpeechRecognizer } from 'microsoft-cognitiveservices-speech-sdk'

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  name = 'Speech To Text';
  public recognizing = false;
  public notification: string;
  public innerHtml: string = '';
  public lastRecognized: string = '';
  _recognizer: SpeechRecognizer;
  startButton(event) {
    if (this.recognizing) {
      this.stop();
      this.recognizing = false;
    }
    else {

      this.recognizing = true;
      console.log("record");

      //const { webkitSpeechRecognition }: IWindow = <IWindow>window;
      const audioConfig = AudioConfig.fromDefaultMicrophoneInput();

      const speechConfig = SpeechConfig.fromSubscription("6cabd6feaa1a4ac99977dd95b703c370", "eastus");
      speechConfig.speechRecognitionLanguage = 'en-US';
      speechConfig.endpointId = 'bb1706cd-f71d-4901-9240-5a0d5e08be7a';
      speechConfig.enableDictation();
      this._recognizer = new SpeechRecognizer(speechConfig, audioConfig)
      this._recognizer.recognizing = this._recognizer.recognized = this.recognizerCallback.bind(this)
      this._recognizer.recognizeOnceAsync();

      // Signals that the speech service has detected that speech has stopped.
      this._recognizer.speechEndDetected = (s, e) => {
        console.error('speechEndDetected');
        this.recognizing = false;
      };
    }
  }
  recognizerCallback(s, e) {
    console.warn(`recognizerCallback`);
    console.log(e);
    const resultText = e.result.text;
    console.warn(`resultText`);
    console.warn(resultText);
    const reason = ResultReason[e.result.reason];
    console.log(reason);
    if (reason == "RecognizingSpeech") {
      this.innerHtml = this.lastRecognized + e.result.text;
    }
    if (reason == "RecognizedSpeech") {
      this.lastRecognized += e.result.text + "\r\n";
      this.innerHtml = this.lastRecognized;
    }
  }
  stop() {

    this._recognizer.stopContinuousRecognitionAsync(

      stopRecognizer.bind(this),

      function (err) {

        stopRecognizer.bind(this)

        console.error(err)

      }.bind(this)

    )



    function stopRecognizer() {

      this._recognizer.close()

      this._recognizer = undefined

      console.log('stopped')

    }

  }
}
