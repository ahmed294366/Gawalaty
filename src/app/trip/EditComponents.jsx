"use client"
import { useEffect, useState } from "react";
import { UpdateReviewAction, UpdateTripAction } from "./tripActions"
import { UpdateTripSchema } from "./tripSchema"
import { UploadImage } from "@/utils/cloudinary";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { getFeauturesAction } from '@/shared/ServerAction';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { Upload, X, Check } from "lucide-react";
import { getCategories } from "@/shared/ServerAction";
import { getGuidesAction } from "./tripActions";

export function EditReview({ reviewStates, reviewNative, setReviewStates, setTripReviews, tripReviews }) {
  const [comment, setcomment] = useState(reviewStates.review.comment || "");
  const [imagespublicIds, setImagesToDelete] = useState([])
  const [newImages, setNewImages] = useState([]);

  async function HandleUpdate() {
    const oldImagesNum = reviewStates.review.images.length - imagespublicIds.length

    if ((oldImagesNum + newImages.length) > 3) {
      return toast.error("max number of images for review is (3)")
    }
    let uploadedImages = null;
    if (newImages.length > 0) {
      const uploadResults = await Promise.allSettled(
        newImages.map(img => UploadImage(img))
      );
      const successUploads = uploadResults
        .filter(r => r.status === "fulfilled" && r.value?.url && r.value?.publicid)
        .map(r => ({
          url: r.value.url,
          publicid: r.value.publicid
        }));

      const failedUploads = uploadResults.filter(r => r.status === "rejected");
      if (failedUploads.length > 0) {
        toast.error(`failed to upload ${failedUploads.length} image(s)`);
      }
      if (successUploads.length === 0) {
        return toast.error("image(s) failed to uploaded ,try again")
      }
      uploadedImages = successUploads
    }

    let obj = { id: reviewStates.review.id, comment };

    const response = await UpdateReviewAction({ obj, imagespublicIds, uploadedImages, currentEditingReview: reviewStates.review });
    if (response?.error) {
      return toast.error(response.message)
    }
    const newreviews = tripReviews.map(rev => {
      if (rev.id === response.id) {
        return response
      }
      return rev
    });

    setTripReviews(newreviews)
    setReviewStates(reviewNative)
    return toast.success("updated success")
  }
  
  return (
    <div
      onClick={() => setReviewStates(reviewNative)}
      className='flex fixed top-0 left-0 z-50 items-center justify-center w-full h-screen bg-black/40'>
      <div
        onClick={(e) => e.stopPropagation()}
        className='space-y-4 w-lg max-w-full rounded-md bg-white p-4'>
        <h1 className='text-2xl font-semibold mb-4'>Update Review</h1>
        <div>
          <label htmlFor='comment' className={"text-zinc-600 font-semibold"}>Comment</label>
          <Textarea
            type="text"
            id="comment"
            className={"border-2 border-neutral-400 mb-3 mt-2"}
            value={comment}
            onChange={(e) => setcomment(e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="file"
            multiple
            id='upload'
            className="hidden"
            accept="image/*"
            onChange={(e) => {
              const files = Array.from(e.target.files);
              setNewImages((prev) => [...prev, ...files]);
            }}
          />
          <label className='border-2 rounded hover:bg-gray-50 px-3 py-1' htmlFor="upload">Add-Images</label>
        </div>
        {reviewStates.review.images?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {reviewStates?.review?.images?.filter(img => !(imagespublicIds.includes(img.publicid)))?.map((img, index) => (
              <div key={index} className="relative">
                <img
                  src={img.url}
                  alt={`Selected ${index}`}
                  className="h-20 w-20 object-cover rounded border"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImagesToDelete([...imagespublicIds, img.publicid])
                  }}
                  className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow hover:bg-red-100"
                >
                  <X className="h-3 w-3 text-red-600" />
                </button>
              </div>
            ))}
          </div>
        )}
        {newImages.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {newImages?.map((img, index) => (
              <div key={index} className="relative">
                <img
                  src={URL.createObjectURL(img)}
                  alt={`Selected ${index}`}
                  className="h-20 w-20 object-cover rounded border"
                />
                <button
                  type="button"
                  onClick={() => {
                    const NewImages = newImages?.filter((_, i) => i !== index);
                    setNewImages(NewImages)
                  }}
                  className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow hover:bg-red-100"
                >
                  <X className="h-3 w-3 text-red-600" />
                </button>
              </div>
            ))}
          </div>
        )}
        <div className='flex flex-col justify-end gap-2 sm:flex-row'>
          <Button variant={"outline"}
            onClick={() => setReviewStates(reviewNative)}>
            cancel
          </Button>
          <Button
            onClick={() => { HandleUpdate() }}
            className={" bg-amber-500 hover:bg-amber-400"}>
            update
          </Button>
        </div>
      </div>
    </div>
  )
}

export function EditTripForm({ trip, setSelectedImage, setTrip, setTripStates }) {

  const [categories, setCategories] = useState([]);
  const [featureToAdd, setFeatureToAdd] = useState([]);
  const [featureToDelete, setFeatureToDelete] = useState([]);
  const [open, setOpen] = useState("");

  const [newTrip, setNewTrip] = useState({
    title: trip.title, description: trip.description, duration: trip.duration, location: trip.location, category: trip.categoryid, guide: trip.guide.id, price: trip.price, newImages: [], publicIds: []
  });

  useEffect(() => {
    async function getAllCategories() {
      const data = await getCategories();
      if (data?.error) {
        throw new Error(data.message)
      }
      setCategories(data)
    }
    getAllCategories()
  }, []);

  async function HandleTripUpdate() {
    // UpdateTripSchema
    let obj = {};
    if (newTrip.title.trim() !== trip.title.trim()) { obj.title = newTrip.title }
    if (newTrip.description.trim() !== trip.description.trim()) { obj.description = newTrip.description }
    if (newTrip.duration.trim() !== trip.duration.trim()) { obj.duration = newTrip.duration }
    if (newTrip.location.trim() !== trip.location.trim()) { obj.location = newTrip.location }
    if (+newTrip.price !== +trip.price) { obj.price = +newTrip.price }
    if (newTrip.guide !== trip.guide.id) { obj.guide = newTrip.guide }
    if (newTrip.category !== trip.category) { obj.category = newTrip.category }


    const { error } = UpdateTripSchema(obj);
    if (error) { return toast.error(error.details[0].message) }

    if (((trip.images.length - newTrip.publicIds.length) + newTrip.newImages.length) > 4) {
      return toast.error("max images for trip is 4 ...")
    }
    let imagesUploaded = [];
    if (newTrip.newImages.length > 0) {
      const uploadResults = await Promise.allSettled(
        newTrip.newImages.map(img => UploadImage(img))
      );
      const successUploads = uploadResults
        .filter(r => r.status === "fulfilled" && r.value?.url && r.value?.publicid)
        .map(r => ({
          url: r.value.url,
          publicid: r.value.publicid
        }));

      const failedUploads = uploadResults.filter(r => r.status === "rejected" || !r.value?.url);
      if (failedUploads.length > 0) {
        return toast.error(`failed to upload ${failedUploads.length} image(s)`);
      }

      if (successUploads.length !== 0) {
        imagesUploaded = successUploads
      } else {
        return toast.error("failed to upload images, try again")
      }
    }

    const response = await UpdateTripAction({ id: trip.id, newImages: imagesUploaded, obj, imagespublicIds: newTrip.publicIds, featureToAdd, featureToDelete });
    if (response?.error) {
      return toast.error(response.message)
    } else {
      setFeatureToAdd([]);
      setFeatureToDelete([])
      setSelectedImage(0);
      setTripStates({ edit: false, delete: false })
      setTrip({ ...trip, ...response })
      toast.success("Trip updated successfully")
    }

  }

  return (
    <div
      onClick={() => {
        if (open !== "") { setOpen("") }
        setTripStates({ edit: false, delete: false })
      }}
      className='w-full  fixed top-0 left-0 h-screen z-50 flex justify-center items-center bg-black/40'>

      <div
        onClick={(e) => {
          e.stopPropagation()
          if (open !== "") { setOpen("") }
        }}
        className=" bg-white space-y-4 max-h-[calc(100vh-5%)] overflow-y-auto rounded-md w-xl max-w-full p-4 ">

        <h2 className="text-xl font-bold">Edit Trip</h2>
        <div>
          <Label className={"text-md text-neutral-500 mb-1"} htmlFor="trip-title">Title</Label>
          <Input
            id="trip-title"
            spellCheck={false}
            value={newTrip.title}
            onChange={(e) => setNewTrip({ ...newTrip, title: e.target.value })}
            placeholder="Write trip title" />
        </div>



        <div >
          <Label className={"text-md text-neutral-500 mb-1"} htmlFor="trip-description">Description</Label>
          <Textarea
            id="trip-description"
            value={newTrip.description}
            onChange={(e) => setNewTrip({ ...newTrip, description: e.target.value })} placeholder="Enter trip description" />
        </div>


        <div className="flex items-start flex-col sm:flex-row">
          <Label className={"text-md text-neutral-500 mb-1 mr-2"} htmlFor="trip-price">Price</Label>
          <Input
            value={newTrip.price}
            onChange={(e) => setNewTrip({ ...newTrip, price: e.target.value })}
            id="trip-price"
            type="number"
            spellCheck={false}
            placeholder="Enter price"
            min="0"
          />
        </div>




        <div className="flex items-start flex-col sm:flex-row">
          <Label className={"text-md text-neutral-500 mb-1 mr-2"} htmlFor="trip-duration">Duration</Label>
          <Input
            value={newTrip.duration}
            onChange={(e) => setNewTrip({ ...newTrip, duration: e.target.value })}
            id="trip-duration"
            type="text"
            spellCheck={false}
            placeholder="Enter duration"
            min="1"
          />
        </div>


        <div className="flex items-start flex-col sm:flex-row">
          <Label className={"text-md text-neutral-500 mb-1 mr-2"} htmlFor="trip-location ">Location</Label>
          <Input
            value={newTrip.location}
            spellCheck={false}
            onChange={(e) => setNewTrip({ ...newTrip, location: e.target.value })}
            id="trip-location"
            placeholder="Enter location" />
        </div>


        <div className="flex items-start flex-col sm:flex-row">
          <Label className={"text-md mr-2 font-semibold text-neutral-500 mb-1"} htmlFor="trip-admin">Guide</Label>
          <Guides open={open} setOpen={setOpen} newTrip={newTrip} setNewTrip={setNewTrip} />
        </div>

        <div className="flex items-start flex-col sm:flex-row">
          <Label className={"text-md text-neutral-500 mb-1 mr-2"} htmlFor="trip-location ">Category</Label>
          <Categories open={open} setOpen={setOpen} newTrip={newTrip} setNewTrip={setNewTrip} categories={categories} />
        </div>

        <div className="flex items-start flex-col sm:flex-row ">
          <Label className={"text-md text-neutral-500 mb-1 mr-2"} htmlFor="trip-location ">Select Features</Label>
          <Features open={open} setOpen={setOpen} trip={trip} setTrip={setTrip} featureToAdd={featureToAdd} setFeatureToAdd={setFeatureToAdd} featureToDelete={featureToDelete} setFeatureToDelete={setFeatureToDelete} tripFeature={trip.features} />
        </div>

        <div>
          <div>
            <div className='mb-3'>
              <Label htmlFor="trip-image" className={"text-md bg-zinc-100 w-full py-4 rounded-sm cursor-pointer flex items-center flex-col gap-2 hover:bg-blue-100"}>
                <Upload />
                New Images
              </Label>
              <input
                id="trip-image"
                style={{ display: "none" }}
                type={"file"}
                multiple
                onChange={(e) => {
                  setNewTrip({ ...newTrip, newImages: [...newTrip.newImages, ...Array.from(e.target.files)] })
                }}
              />
            </div>
            <div className='flex gap-2 flex-wrap'>
              {newTrip.newImages?.map((img, indx) => {
                return (
                  <div className='relative' key={indx}>
                    <Image
                      src={URL.createObjectURL(img)}
                      width={100}
                      height={100}
                      alt={"trip-image"}
                      className='rounded-md '
                    />
                    <button
                      onClick={() => {
                        const Images = newTrip.newImages.filter((img, i) => i !== indx);
                        setNewTrip({ ...newTrip, NewImages: Images })
                      }}

                      className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow hover:bg-red-100"
                    >
                      <X className="h-3 w-3 text-red-600" />
                    </button>
                  </div>
                )
              })}
              {/* new photos */}
            </div>
          </div>
        </div>
        <div className='flex gap-2 flex-wrap pt-5 border-t-2 '>
          {trip.images?.filter(img => !(newTrip.publicIds.includes(img.publicid))).map(img => {
            return (
              <div className='relative' key={img.id}>
                <Image
                  src={img.url}
                  width={100}
                  height={100}
                  alt={"trip-image"}
                  className='rounded-md h-full'
                />
                <button
                  onClick={() =>
                    setNewTrip({ ...newTrip, publicIds: [...newTrip.publicIds, img.publicid] })}
                  type="button"
                  className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow hover:bg-red-100"
                >
                  <X className="h-3 w-3 text-red-600" />
                </button>
              </div>
            )
          })}
        </div>
        <div className='w-full gap-2 mt-4 flex flex-col sm:flex-row justify-end'>
          <Button
            onClick={() => setTripStates({ edit: false, delete: false })}
            variant={"outline"}>Cancel</Button>
          <Button
            onClick={() => { HandleTripUpdate() }}>Update</Button>
        </div>
      </div >
    </div >
  )
}

function Features({ open, setOpen, featureToAdd, setFeatureToAdd, featureToDelete, setFeatureToDelete, tripFeature }) {

  const [features, setFeatures] = useState([]);
  const currentFeaturesIds = tripFeature.map(f => f.featureId);
  const currentFeatures = features.filter(f => currentFeaturesIds.includes(f.id));
  const othersFeature = features.filter(f => !(currentFeaturesIds.includes(f.id)));


  useEffect(() => {
    async function getFeatures() {
      const data = await getFeauturesAction();
      if (data?.error) {
        throw new Error(data.message)
      }
      setFeatures(data)
    }
    getFeatures()
  }, [])

  return (
    <div onClick={(e) => e.stopPropagation()} className="w-20 relative">
      <Button variant={"outline"} onClick={() => {
        if (open === "features") {
          setOpen("")
        } else {
          setOpen("features")
        }
      }}>
        Features
      </Button>
      {open === "features" &&
        <div className={"absolute capitalize top-10 left-0 z-50 bg-white py-2 px-3 w-60 overflow-hidden text-ellipsis font-semibold text-zinc-500 space-y-1 border rounded-md"}>

          <div className="font-bold text-sm text-blue-800 border-b border-b-blue-800 mt-2"> Current </div>

          {currentFeatures?.map((feature) => {
            return (
              <div key={feature.id}
                className={`flex items-center gap-2 justify-between hover:text-black ${featureToDelete.includes(feature.id) && "text-black"} cursor-default text-nowrap`}
                onClick={() => {
                  if (featureToDelete.includes(feature.id)) {
                    setFeatureToDelete(featureToDelete.filter((f) => f !== feature.id))
                  } else {
                    setFeatureToDelete([...featureToDelete, feature.id])
                  }
                }}
              >
                {feature.name}
                {featureToDelete.includes(feature.id) && <X className="w-5 h-5 text-red-600" />}
              </div>
            )
          })}

          <div className="font-bold text-sm text-blue-800 border-b border-b-blue-800 mt-2">Others</div>
          {othersFeature?.map((feature) => {
            return (
              <div key={feature.id} className={`flex items-center gap-2 justify-between hover:text-black ${featureToAdd.includes(feature.id) && "text-black"} cursor-default text-nowrap`}
                onClick={() => {
                  if (featureToAdd.includes(feature.id)) {
                    setFeatureToAdd(featureToAdd.filter((f) => f !== feature.id))
                  } else {
                    setFeatureToAdd([...featureToAdd, feature.id])
                  }
                }}
              >
                {feature.name}
                {featureToAdd.includes(feature.id) && <Check className="w-5 h-5 text-emerald-600" />}
              </div>
            )
          })}
        </div>
      }
    </div>
  )
}

function Categories({ open, setOpen, newTrip, setNewTrip, categories }) {
  const current = categories.filter(c => c.id === newTrip.category)[0]?.name

  return (
    <div onClick={(e) => e.stopPropagation()} className="w-20 relative">
      <Button variant={"outline"} onClick={() => {
        if (open === "categories") {
          setOpen("")
        } else {
          setOpen("categories")
        }
      }}>
        {current}
      </Button>
      {open === "categories" &&
        <div className={"absolute capitalize top-10 left-0 z-50 bg-white py-2 px-3 w-60 font-semibold text-zinc-500 space-y-1 border rounded-md"}>

          <div className="font-bold text-sm text-blue-800 border-b border-b-blue-800 mt-2"> Current </div>

          {categories?.map((category) => {
            return (
              <div
                key={category.id}
                className={`flex items-center gap-2 justify-between hover:text-black ${category.id === newTrip.category && "text-black"} cursor-default text-nowrap`}
                onClick={() => {
                  setNewTrip({ ...newTrip, category: category.id })
                }}>
                {category.name}
                {category.id === newTrip.category && <Check className="w-5 h-5 text-emerald-600" />}
              </div>
            )
          })}
        </div>
      }
    </div>
  )
}

function Guides({ open, setOpen, newTrip, setNewTrip }) {
  const [guides, setGuides] = useState([]);

  useEffect(() => {
    async function getGuides() {
      const data = await getGuidesAction();
      if (data?.error) { throw new Error(data.message) }
      setGuides(data)
    }
    getGuides()

  }, []);

  const current = guides.filter(g => g.id === newTrip.guide)[0];
  return (
    <div onClick={(e) => e.stopPropagation()} className="w-20 relative">
      <Button variant={"outline"}
        onClick={() => {
          if (open === "guides") {
            setOpen("")
          } else {
            setOpen("guides")
          }
        }}>
        {current?.name}
      </Button>
      {open === "guides" &&

        <div className={"absolute capitalize top-10 left-0 z-50 bg-white py-2 px-3 w-60 font-semibold text-zinc-500 space-y-1 border rounded-md"}>
          {guides?.map((guide) => {
            return (
              <div
                key={guide.id}
                className={`flex items-center gap-2 justify-between hover:text-black ${guide.id === newTrip.guide && "text-black"} cursor-default text-nowrap`}
                onClick={() => {
                  setNewTrip({ ...newTrip, guide: guide.id })
                }}>
                {guide.name}
                {guide.id === newTrip.guide &&
                  <Check className="w-5 h-5 text-emerald-600" />
                }
              </div>
            )
          })}
        </div>
      }
    </div>
  )
}
