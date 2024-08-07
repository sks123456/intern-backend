const asyncHandler = require("express-async-handler");
const Contact = require("../models/contactModel");
const User = require("../models/userModel");

//@desc Get all contacts
//@route Get /api/contacts
//@access private
const getContacts = asyncHandler(async (req, res) => {
  const contacts = await Contact.findAll({ where: { user_id: req.user.id } });
  res.status(200).json(contacts);
});

//@desc Create new contact
//@route POST /api/contacts
//@access private
const createContact = asyncHandler(async (req, res) => {
  console.log("The request body is:", req.body);
  const { name, email, phone } = req.body;

  // param validation
  if ((!name, !email || !phone)) {
    res.status(400);
    throw new Error("All fields are mandatory");
  }

  // create record in MySQL
  const contact = await Contact.create({
    name,
    email,
    phone,
    user_id: req.user.id,
  });

  res.status(201).json(contact);
});

//@desc Get contact
//@route Get /api/contacts/:id
//@access private
const getContact = asyncHandler(async (req, res) => {
  const contact = await Contact.findByPk(req.params.id);
  if (!contact) {
    res.status(404);
    throw new Error("Contact not found");
  }
  res.status(200).json(contact);
});

//@desc Update contact
//@route PUT /api/contacts/:id
//@access private
const updateContact = asyncHandler(async (req, res) => {
  //find contact to be updated
  const contact = await Contact.findByPk(req.params.id);
  if (!contact) {
    res.status(404);
    throw new Error("Contact not found");
  }

  //authorize user update action
  if (contact.user_id !== req.user.id) {
    res.status(403);
    throw new Error(
      "User doesn't have permission to update other user's contacts."
    );
  }

  // update action
  const updatedContact = await contact.update(req.body);

  res.status(200).json(updatedContact);
});

//@desc Delete contact
//@route Delete /api/contacts/:id
//@access private
const deleteContact = asyncHandler(async (req, res) => {
  //finding contact to be deleted
  const contact = await Contact.findByPk(req.params.id);
  if (!contact) {
    res.status(404);
    throw new Error("Contact not found");
  }

  // authorize user
  if (contact.user_id !== req.user.id) {
    res.status(403);
    throw new Error(
      "User doesn't have permission to delete other user's contacts."
    );
  }

  // delete action
  await contact.destroy();
  res.status(200).json({ message: "Contact deleted" });
});

module.exports = {
  getContact,
  createContact,
  getContacts,
  updateContact,
  deleteContact,
};
