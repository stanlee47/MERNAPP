import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { FaEdit, FaTrash } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";

function Dashboard({ setIsLoggedIn, user }) {
    const [panCards, setPanCards] = useState([]);
    const [panCard, setPanCard] = useState({ name: "", panNumber: "", dob: "" });
    const [editId, setEditId] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (user && user.email) {
            fetchPanCards();
        }
    }, [user]);

    const fetchPanCards = async () => {
        try {
            const response = await axios.get("http://localhost:8000/viewPanCards", {
                params: { email: user.email }
            });
            console.log("Fetched PAN cards:", response.data); // Debug log
            setPanCards(response.data);
        } catch (error) {
            console.error("Error fetching PAN cards:", error);
            toast.error("Failed to fetch PAN cards");
        }
    };

    const handleChange = (e) => {
        setPanCard({ ...panCard, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;
        if (!user || !user.email) {
            toast.error("User not authenticated. Please log in again.");
            setIsLoggedIn(false);
            navigate('/');
            return;
        }

        const { name, panNumber, dob } = panCard;
        if (!name.trim() || !panNumber.trim() || !dob.trim()) {
            toast.error("All fields are required and cannot be empty!");
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = { ...panCard, createdBy: user.email };
            console.log("Submitting payload:", payload);
            if (editId) {
                await axios.put(`http://localhost:8000/editPanCard/${editId}`, payload);
                toast.success("PAN Card Updated Successfully");
            } else {
                await axios.post("http://localhost:8000/addPanCard", payload);
                toast.success("PAN Card Added Successfully");
            }
            setPanCard({ name: "", panNumber: "", dob: "" });
            setEditId(null);
            await fetchPanCards(); // Ensure fetchPanCards is awaited
        } catch (error) {
            console.error("Error submitting PAN card:", error);
            console.error("Error response:", error.response?.data);
            toast.error(error.response?.data?.error || error.message || "Failed to add PAN card");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (panCard) => {
        setPanCard({ name: panCard.name, panNumber: panCard.panNumber, dob: panCard.dob });
        setEditId(panCard._id);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this PAN card?")) {
            try {
                await axios.delete(`http://localhost:8000/deletePanCard/${id}`);
                toast.success("PAN Card Deleted Successfully");
                await fetchPanCards();
            } catch (error) {
                console.error("Error deleting PAN card:", error);
                toast.error("Failed to delete PAN card");
            }
        }
    };

    const handleLogout = () => {
        setIsLoggedIn(false);
        setUser(null); // Clear user state
        navigate('/');
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>PAN Card Details for {user?.name}</h1>
                <div className="action-buttons">
                    <Link 
                        to="#" 
                        onClick={() => setPanCard({ name: "", panNumber: "", dob: "" })} 
                        className="text-blue-500 hover:underline"
                    >
                        Add New PAN Card →
                    </Link>
                    <button 
                        onClick={handleLogout} 
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                    >
                        Logout
                    </button>
                </div>
            </div>

            <div className="form-container">
                <form onSubmit={handleSubmit}>
                    <input
                        name="name"
                        placeholder="Name"
                        value={panCard.name}
                        onChange={handleChange}
                        required
                    />
                    <input
                        name="panNumber"
                        placeholder="PAN Number"
                        value={panCard.panNumber}
                        onChange={handleChange}
                        required
                    />
                    <input
                        name="dob"
                        placeholder="Date of Birth (YYYY-MM-DD)"
                        value={panCard.dob}
                        onChange={handleChange}
                        required
                    />
                    <button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Submitting..." : editId ? "Update PAN Card" : "Add PAN Card"}
                    </button>
                </form>
            </div>

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Sl.No</th>
                            <th>Name</th>
                            <th>PAN Number</th>
                            <th>Date of Birth</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {panCards.map((p, index) => (
                            <tr key={index}>
                                <td>{index + 1}</td>
                                <td>{p.name}</td>
                                <td>{p.panNumber}</td>
                                <td>{p.dob}</td>
                                <td className="action-icons">
                                    <button onClick={() => handleEdit(p)} className="edit">
                                        <FaEdit size={18} />
                                    </button>
                                    <button onClick={() => handleDelete(p._id)} className="delete">
                                        <FaTrash size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <ToastContainer position="top-left" autoClose={3000} hideProgressBar closeOnClick />
        </div>
    );
}

export default Dashboard;