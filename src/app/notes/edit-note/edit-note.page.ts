import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NotesService } from '../notes.service';
import { Router, ActivatedRoute } from '@angular/router';
import { NavController, AlertController, LoadingController } from '@ionic/angular';
import { Note } from '../notes.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-edit-note',
  templateUrl: './edit-note.page.html',
  styleUrls: ['./edit-note.page.scss'],
})
export class EditNotePage implements OnInit, OnDestroy {
  note: Note;
  noteId: string;
  form: FormGroup;
  isLoading = false;
  private noteSub: Subscription;

  constructor(
    private notesService: NotesService,
    private router: Router,
    private route: ActivatedRoute,
    private navCtrl: NavController,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController
  ) { }

  ngOnInit() {
    this.route.paramMap.subscribe(paramMap => {
      if (!paramMap.has('noteId')) {
        this.navCtrl.navigateBack('/notes');
        return;
      }
      this.noteId = paramMap.get('noteId');
      this.isLoading = true;
      this.noteSub = this.notesService
        .getNote(paramMap.get('noteId'))
        .subscribe(
          note => {
            this.note = note;
            this.form = new FormGroup({
              title: new FormControl(this.note.title, {
                updateOn: 'change',
                validators: [Validators.required]
              }),
              description: new FormControl(this.note.description, {
                updateOn: 'change',
                validators: [Validators.required, Validators.minLength(1)]
              })
            });
            this.isLoading = false;
          },
          error => {
            this.alertCtrl
              .create({
                header: 'An error occurred!',
                message: 'Note could not be fetched. Please try again later.',
                buttons: [
                  {
                    text: 'Okay',
                    handler: () => {
                      this.router.navigate(['/notes']);
                    }
                  }
                ]
              })
              .then(alertEl => {
                alertEl.present();
              });
          }
        );
    });
  }

  onUpdateNote() {
    if (!this.form.valid) {
      return;
    }
    this.loadingCtrl
      .create({
        message: 'Updating note...'
      })
      .then(loadingEl => {
        loadingEl.present();
        this.notesService
          .updateNote(
            this.note.id,
            this.form.value.title,
            this.form.value.description
          )
          .subscribe(() => {
            loadingEl.dismiss();
            this.form.reset();
            this.router.navigate(['/notes']);
          });
      });
  }

  ngOnDestroy() {
    this.noteSub.unsubscribe();
  }

}
