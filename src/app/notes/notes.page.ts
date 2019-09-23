import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActionSheetController, Platform, LoadingController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { NotesService } from './notes.service';
import { Subscription } from 'rxjs';
import { Note } from './notes.model';
import { Plugins, ShareOptions } from '@capacitor/core';
import { AdOptions, AdSize, AdPosition } from 'capacitor-admob';
const { Share } = Plugins;
const { AdMob } = Plugins;

const options: AdOptions = {
  adId: 'ca-app-pub-3940256099942544/6300978111',
  adSize: AdSize.SMART_BANNER,
  position: AdPosition.BOTTOM_CENTER
};

@Component({
  selector: 'app-notes',
  templateUrl: './notes.page.html',
  styleUrls: ['./notes.page.scss'],
})
export class NotesPage implements OnInit, OnDestroy {
  isLoading = false;
  loadedNotes: Note[];
  myNotes: Note[];
  private notesSub: Subscription;
  shareObject: ShareOptions = {};

  constructor(
    public platform: Platform,
    private actionSheetCtrl: ActionSheetController,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private router: Router,
    private notesService: NotesService
  ) {
    if (this.platform.is('mobile') && this.platform.is('hybrid') && this.platform.is('android')) {
      // Show Banner Ad
      AdMob.showBanner(options)
      .then(
          (value) => {
              console.log(value);  // true
          },
          (error) => {
              console.log(error); // show error
          }
      );
      // Subscibe Banner Event Listener
      AdMob.addListener('onAdLoaded', (info: boolean) => {
        console.log('Banner Ad Loaded');
      });
    }
  }

  share(note: Note) {
     Share.share({
      dialogTitle: note.title,
      text: `${note.title}
      ` + note.description,
      title: note.title
    }).then(res => {
      console.log(res);
    },
    error => {
      console.log(error);
    }
    );
  }

  ngOnInit() {
    this.notesSub = this.notesService.notes.subscribe(notes => {
      this.loadedNotes = notes;
    });
  }


  ionViewWillEnter() {
    this.isLoading = true;
    this.notesService.fetchNotes().subscribe(() => {
      this.isLoading = false;
    });

    if (this.platform.is('mobile') && this.platform.is('hybrid') && this.platform.is('android')) {
    // Show Banner Ad
    AdMob.showBanner(options)
    .then(
        (value) => {
            console.log(value);  // true
        },
        (error) => {
            console.log(error); // show error
        }
    );
    }
  }

  ionViewWillLeave() {
    if (this.platform.is('mobile') && this.platform.is('hybrid') && this.platform.is('android')) {
      AdMob.hideBanner().then(
        (value) => {
            console.log(value);  // true
        },
        (error) => {
            console.log(error); // show error
        }
      );
    }
  }

  addNote() {
    this.router.navigateByUrl('/notes/new');
  }

  showActionSheet(note: Note) {
    if (this.platform.is('mobile') && this.platform.is('hybrid')) {
      this.actionSheetCtrl.create(
        {
        header: 'Choose an action',
        buttons: [
          {
            text: 'Delete Note',
            role: 'destructive',
            icon: 'trash',
            handler: () => {
              this.onDeleteNote(note.id);
            }
          },
          {
            text: 'Share Note',
            icon: 'share',
            handler: () => {
              this.share(note);
            }
          },
        {
          text: 'Cancel',
          role: 'cancel',
          icon: 'close'
        }
      ]
       }).then(actionSheetEl => {
         actionSheetEl.present();
       });
    } else {
      this.actionSheetCtrl.create(
        {
        header: 'Choose an action',
        buttons: [
          {
            text: 'Delete Note',
            role: 'destructive',
            icon: 'trash',
            handler: () => {
              this.onDeleteNote(note.id);
            }
          },
        {
          text: 'Cancel',
          role: 'cancel',
          icon: 'close'
        }
      ]
       }).then(actionSheetEl => {
         actionSheetEl.present();
       });
    }
  }

  onDeleteNote(noteId: string) {
    this.loadingCtrl.create({ message: 'Deleting note ...' }).then(
      loadingEl => {
        loadingEl.present();
        this.notesService.deleteNote(noteId).subscribe(() => {
          loadingEl.dismiss();
          this.onDeleteToast();
        });
      }
    );
  }

 onDeleteToast() {
   this.toastCtrl.create({
     message: 'Note deleted permanently',
     duration: 3000,
     position: 'bottom'
    }).then(toastEl => {
      toastEl.present();
    });
 }

  ngOnDestroy() {
    if (this.notesSub) {
      this.notesSub.unsubscribe();
    }
  }

}
