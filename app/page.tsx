"use client" 
import { useEffect, useState, FormEvent } from "react"
import { supabase } from "@/lib/supabase"
import toast, { Toaster } from "react-hot-toast"
import Swal from "sweetalert2"
import "sweetalert2/dist/sweetalert2.min.css"

interface Student {
  id?: string;
  name: string;
  email: string;
  phone_number: string;
  gender: string;
}

export default function Home() {

  const [student, setStudents] = useState<Student[]>([]);
  const[form, setForm] = useState<Student>({
    name: "",
    email: "",
    phone_number: "",
    gender: "Male"
  })

  const [editId, setEditId] = useState<string | null>(null);

  async function handleFormSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    console.log(form);

    const {error} = await supabase.from("Students").insert([form]);
    if(error) {
      toast.error(`Failed to add student: ${error.message}`);
    } else {
      toast.success("Student added successfully");
    }
    setForm({
        name: "",
        email: "",
        phone_number: "",
        gender: "Male"
      });
}      

  return (
    <>
      <div className="container my-5">
        <Toaster />
        <h3 className="mb-4">Student Management</h3>
        <div className="row">
          <div className="col-md-4">
            <div className="card mb-4">
              <div className="card-body">
                <form onSubmit={ handleFormSubmit }>
                  <div className="mb-3">
                    <label className="form-label">Name</label>
                    <input type="text" className="form-control" value={ form.name } onChange={(e) => setForm({ ...form, name: e.target.value })} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input type="email" className="form-control" value={ form.email } onChange={(e) => setForm({ ...form, email: e.target.value })} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Phone Number</label>
                    <input type="text" className="form-control" value={ form.phone_number } onChange={(e) => setForm({ ...form, phone_number: e.target.value })} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Gender</label>
                    <select className="form-select" value={ form.gender } onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <button type="submit" className="btn btn-primary w-100">Add Student</button>
                </form>
              </div>
            </div>
          </div>
          <div className="col-md-8">
            <div className="table-responsive">
              <table className="table table-bordered">
                <thead className="table-light">
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone Number</th>
                    <th>Gender</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Rushikesh Sapkal</td>
                    <td>rushi@example.com</td>
                    <td>1234567890</td>
                    <td>Male</td>
                    <td>
                      <button className="btn btn-sm btn-primary me-2">Edit</button>
                      <button className="btn btn-sm btn-danger">Delete</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
