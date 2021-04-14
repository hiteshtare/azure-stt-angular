import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import * as speechsdk from 'microsoft-cognitiveservices-speech-sdk';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'azure-stt-angular';
  status = 'INITIALIZED: ready to test speech...';

  constructor(private http: HttpClient, private cookieService: CookieService) {

  }

  // tslint:disable-next-line: typedef
  public async componentDidMount() {
    // check for valid speech key/region
    const tokenRes = await this.getTokenOrRefresh();
    if (tokenRes.authToken === null) {
      this.status = 'FATAL_ERROR: ' + tokenRes.error;
    }
  }

  // tslint:disable-next-line: typedef
  public async sttFromMic() {
    const tokenObj = await this.getTokenOrRefresh();

    const speechConfig = speechsdk.SpeechConfig.fromAuthorizationToken(tokenObj.authToken, tokenObj.region);
    speechConfig.speechRecognitionLanguage = 'en-US';

    // Custom Speech endpoint Id
    // speechConfig.endpointId = 'edeb24bf-5178-4fcc-b05d-83a948d846ef';

    // New endpoint
    speechConfig.endpointId = '813293e0-5ec8-4327-b403-3f15d6d4683e';

    const audioConfig = speechsdk.AudioConfig.fromDefaultMicrophoneInput();
    const recognizer = new speechsdk.SpeechRecognizer(speechConfig, audioConfig);

    this.status = 'speak into your microphone...';

    recognizer.recognizeOnceAsync(result => {
      if (result.reason === speechsdk.ResultReason.RecognizedSpeech) {
        this.status = `RECOGNIZED: Text=${result.text}`;
      } else {
        this.status = 'ERROR: Speech was cancelled or could not be recognized. Ensure your microphone is working properly.';
      }
    });
  }

  // tslint:disable-next-line: typedef
  public async getTokenOrRefresh() {
    const speechToken = this.cookieService.get('speech-token');

    if (speechToken === undefined) {
      try {
        const resp = await this.http.get('/api/get-speech-token').toPromise();

        if (resp) {
          // tslint:disable-next-line: no-string-literal
          const token = resp['data']['token'];
          // tslint:disable-next-line: no-string-literal
          const region = resp['data']['region'];
          this.cookieService.set('speech-token', region + ':' + token, { expires: 540, path: '/' });

          console.log('Token fetched from back-end: ' + token);
          // tslint:disable-next-line: object-literal-shorthand
          return { authToken: token, region: region };
        }
        else {
          console.error(`Unable to fetch Token`);
          return { authToken: null, error: '' };
        }
      } catch (err) {
        console.error(err.response.data);
        return { authToken: null, error: err.response.data };
      }
    } else {
      console.log('Token fetched from cookie: ' + speechToken);
      const idx = speechToken.indexOf(':');
      return { authToken: speechToken.slice(idx + 1), region: speechToken.slice(0, idx) };
    }
  }
}

