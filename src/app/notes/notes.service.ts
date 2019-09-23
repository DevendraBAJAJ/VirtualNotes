import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, of } from 'rxjs';
import { Note } from './notes.model';
import { AuthService } from '../auth/auth.service';
import { switchMap, take, tap, map } from 'rxjs/operators';

interface NoteData {
  title: string;
  description: string;
  userID: string;
  createdDate: Date;
}

@Injectable({
  providedIn: 'root'
})
export class NotesService {

  // tslint:disable-next-line: variable-name
  private _notes = new BehaviorSubject<Note[]>([]);

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  get notes() {
    return this._notes.asObservable();
  }

  fetchNotes() {
    let fetchedUserId: string;
    return this.authService.userId.pipe(
      take(1),
      switchMap(userId => {
        fetchedUserId = userId;
        return this.authService.token;
      }),
      take(1),
      switchMap(token => {
      return this.http.get<{ [key: string]: NoteData }>(`https://virtualnotes-95250.firebaseio.com/notes.json?auth=${token}`);
    }),
    map(resData => {
        const notes = [];
        for (const key in resData) {
          if (resData.hasOwnProperty(key) && resData[key].userID === fetchedUserId) {
            notes.push(
              new Note(
                  key,
                  resData[key].title,
                  resData[key].description,
                  resData[key].userID,
                  resData[key].createdDate
                  )
              );
          }
        }
        return notes;
      }),
      tap(notes => {
        this._notes.next(notes);
      })
    );
  }

  addNote(title: string, description: string) {
    let generatedId: string;
    let newNote: Note;
    let fetchedUserId: string;
    return this.authService.userId.pipe(
      take(1),
      switchMap(userId => {
        fetchedUserId = userId;
        console.log(fetchedUserId);
        return this.authService.token;
      }),
      switchMap(token => {
        if (!fetchedUserId) {
          throw new Error('User not found!!');
        }
        newNote = new Note(
          Math.random().toString(),
          title,
          description,
          fetchedUserId,
          new Date()
        );
        return this.http.post<{name: string}>(
          `https://virtualnotes-95250.firebaseio.com/notes.json?auth=${token}`,
          { ...newNote, id: null});
      }),
      switchMap(resData => {
        generatedId = resData.name;
        return this.notes;
      }),
      take(1),
      tap(notes => {
        newNote.id = generatedId;
        this._notes.next(notes.concat(newNote));
      })
    );
  }

  updateNote(noteId: string, title: string, description: string) {
    let updatedNotes: Note[];
    let fetchedToken: string;
    return this.authService.token.pipe(
      take(1),
      switchMap(token => {
        fetchedToken = token;
        return this.notes;
      }),
      take(1),
      switchMap(notes => {
        if (!notes || notes.length <= 0) {
          return this.fetchNotes();
        } else {
          return of(notes);
        }
      }),
      switchMap(notes => {
        const updatedIndex = notes.findIndex(note => note.id === noteId);
        updatedNotes = [...notes];
        const oldNote = updatedNotes[updatedIndex];
        updatedNotes[updatedIndex] = new Note(
          oldNote.id,
          title,
          description,
          oldNote.userID,
          oldNote.createdDate
          );
        return this.http.put(`https://virtualnotes-95250.firebaseio.com/notes/${noteId}.json?auth=${fetchedToken}`,
          {...updatedNotes[updatedIndex], id: null}
          );
      }),
      tap(() => {
        this._notes.next(updatedNotes);
      })
    );
  }

  getNote(id: string) {
    return this.authService.token.pipe(
      take(1),
      switchMap(token => {
      return this.http.get<NoteData>(`https://virtualnotes-95250.firebaseio.com/notes/${id}.json?auth=${token}`);
    }),
    map(noteData => {
        return new Note(
          id,
          noteData.title,
          noteData.description,
          noteData.userID,
          noteData.createdDate
          );
      })
    );
  }


  deleteNote(noteId: string) {
    return this.authService.token.pipe(
      take(1),
      switchMap(token => {
        return this.http.delete(`https://virtualnotes-95250.firebaseio.com/notes/${noteId}.json?auth=${token}`);
      }),
      switchMap(() => {
        return this.notes;
      }),
      take(1),
      tap(notes => {
      this._notes.next(notes.filter(note => note.id !== noteId));
    }));
  }

}
