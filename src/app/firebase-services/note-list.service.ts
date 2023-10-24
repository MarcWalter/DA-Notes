import { Injectable, inject } from '@angular/core';
import { Firestore, collection, doc, collectionData, onSnapshot, addDoc, updateDoc, deleteDoc, query, where, orderBy, limit } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Note } from '../interfaces/note.interface';

@Injectable({
  providedIn: 'root'
})
export class NoteListService {

  // items$;
  // items;
  normalNotes: Note[] = [];
  trashNotes: Note[] = [];
  normalMarkedNotes: Note[] = [];

  unsubNotes;
  unsubTrash;
  unsubMarkedNotes;

  firestore: Firestore = inject(Firestore);

  constructor() { 
    this.unsubNotes = this.subNotesList();
    this.unsubTrash = this.subTrashList();
    this.unsubMarkedNotes = this.subMarkedNotesList();
    // this.unsubSingle = onSnapshot(this.getNotesRef(), (list) => {
    //   list.forEach(element => {
    //     console.log(element);
        
    //   });
    // })

    // this.items$ = collectionData(this.getNotesRef());
    // this.items = this.items$.subscribe((list) => {
    //   list.forEach(element => {
    //     console.log(element);        
    //   });
    // });
  }

   async deleteNote(coId: 'notes' | 'trash', docId: string) {
    await deleteDoc(this.getSingleDocRef(coId, docId)).catch(err => {
      console.log(err);
    });
  }
  

  async updateNote(note: Note) {
    if (note.id) {
      let docRef = this.getSingleDocRef(this.getColIdFromNote(note), note.id);
      await updateDoc(docRef, this.getCleanJson(note)).catch(
        (err) => {console.error(err);}
        
      )
    }
    
  }

  getCleanJson(note:Note):{} {
    return {
      type: note.type,
      titel: note.titel,
      content: note.content,
      marked: note.marked
    }
  }

  async addNote(item: Note, coId: "notes" | "trash"){
    if (coId == "notes") {
      await addDoc(this.getNotesRef(), item).catch(
        (err) => {console.error(err)}
      ).then(
        (docRef) => {console.log("Document written with ID: ", docRef?.id);}
      )
    } else {
      await addDoc(this.getTrashRef(), item).catch(
        (err) => {console.error(err)}
      ).then(
        (docRef) => {console.log("Document written with ID: ", docRef?.id);}
      )
    }
   
  }

  getColIdFromNote(note: Note) {
    if(note.type == 'note') {
      return 'notes';
    } else {
      return 'trash';
    }
  }

  // const itemCollection = collection(this.firestore, 'items');

  setNoteObject(obj: any, id: string): Note {
    return {
      id: id,
      type: obj.type || "note",
      titel: obj.titel || "",
      content: obj.content || "",
      marked: obj.marked || false,
    }
  }

  getNotesRef() {
    return collection(this.firestore, 'notes');
  }

  getTrashRef() {
    return collection(this.firestore, 'trash');
  }

  getSingleDocRef(coId:string, docId:string){
    return doc(collection(this.firestore, coId), docId);
  }

  subNotesList() {
    const q = query(this.getNotesRef(), limit(100));
    return onSnapshot(q, (list) => {
      this.normalNotes = [];
      list.forEach(element => {
        this.normalNotes.push(this.setNoteObject(element.data(), element.id));        
      });
    });
  }

  subMarkedNotesList() {
    const q = query(this.getNotesRef(), where("marked", "==", true), limit(100));
    return onSnapshot(q, (list) => {
      this.normalNotes = [];
      list.forEach(element => {
        this.normalMarkedNotes.push(this.setNoteObject(element.data(), element.id));        
      });
    });
  }

  subTrashList() {
    return onSnapshot(this.getTrashRef(), (list) => {
      this.trashNotes = [];
      list.forEach(element => {
        this.trashNotes.push(this.setNoteObject(element.data(), element.id));        
      });
    });
  }

  ngonDestroy() {
    this.unsubNotes();
    this.unsubTrash();
    this.unsubMarkedNotes();
    // this.items.unsubscribe();

  }
}
