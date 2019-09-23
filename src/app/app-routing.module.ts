import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './auth/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: 'notes', pathMatch: 'full' },
  { path: 'auth', loadChildren: './auth/auth.module#AuthPageModule' },
  {
    path: 'notes',
    children: [
      {
          path: '',
          loadChildren: './notes/notes.module#NotesPageModule',
          canLoad: [AuthGuard]
      },
      {
        path: 'new',
        loadChildren: './notes/new-note/new-note.module#NewNotePageModule'
      },
      {
        path: 'edit/:noteId',
        loadChildren: './notes/edit-note/edit-note.module#EditNotePageModule'
      },
      {
          path: ':noteId',
          loadChildren: './notes/note-detail/note-detail.module#NoteDetailPageModule'
      }
    ]
  },
  { path: 'settings', loadChildren: './settings/settings.module#SettingsPageModule' }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
