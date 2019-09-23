import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';
import { NotesService } from '../notes.service';

@Component({
  selector: 'app-new-note',
  templateUrl: './new-note.page.html',
  styleUrls: ['./new-note.page.scss'],
})
export class NewNotePage implements OnInit {
  form: FormGroup;
  constructor(
    private loadingCtrl: LoadingController,
    private router: Router,
    private notesService: NotesService
  ) { }

  ngOnInit() {
    this.form = new FormGroup({
      title: new FormControl(null, {
        updateOn: 'change',
        validators: [Validators.required]
      }),
      description: new FormControl(null, {
        updateOn: 'change',
        validators: [Validators.required, Validators.minLength(1)]
      })
    });
  }

  onAddNote() {
    if (!this.form.valid) {
      return;
    }
    console.log(this.form.value);
    this.loadingCtrl.create({keyboardClose: true, message: 'Saving your note...'}).then(loadingEl => {
      loadingEl.present();
      return this.notesService.addNote(
        this.form.value.title,
        this.form.value.description
        ).subscribe(() => {
        loadingEl.dismiss();
        this.form.reset();
        this.router.navigate(['/notes']);
      });
  });
  }

}
