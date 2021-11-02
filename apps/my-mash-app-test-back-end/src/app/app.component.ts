import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component } from '@angular/core';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  FacebookAuthProvider,
  signInWithPopup,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  linkWithPhoneNumber
} from 'firebase/auth';
import { environment } from '../environments/environment';
@Component({
  selector: 'mashapptest-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements AfterViewInit {
  app = initializeApp(environment.firebaseConfig);
  auth = getAuth(this.app);
  constructor(private http: HttpClient) {
    console.log('start');
    this.auth.onAuthStateChanged((a) => {
      a?.getIdToken().then((t) => {
        // this.loginAPi(t);
        console.log(t);
      });
    });
  }
  async ngAfterViewInit() {
    return;
    const recapcha = new RecaptchaVerifier(
      'sign-in-button',
      {
        size: 'invisible',
        callback: () => {
          // reCAPTCHA solved, allow signInWithPhoneNumber.
          // onSignInSubmit();
        },
      },
      this.auth
    );
    recapcha.render();
    await recapcha.verify();
    const u =  await linkWithPhoneNumber(this.auth.currentUser,'+919925203383',recapcha);
    await u.confirm('123456');
    // await signInWithPhoneNumber(this.auth,'+919925203383',recapcha);

  }
  LoginWithFaceBook() {
    const provider = new FacebookAuthProvider();
    // provider.addScope('user_birthday');
    provider.setCustomParameters({
      display: 'popup',
    });
    signInWithPopup(this.auth, provider).then((a) => {
      console.log(a);
    });
  }
  loginAPi(token: string) {
    this.http
      .post(environment.api_url + 'login', {
        firebase_token: token,
      })
      .toPromise();
  }
}
