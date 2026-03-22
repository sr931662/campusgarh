import React from 'react';
import { useUserProfile, useUpdateProfile } from '../hooks/queries';
import { useForm } from 'react-hook-form';
import Card from '../components/common/Card/Card';
import Button from '../components/common/Button/Button';
import Loader from '../components/common/Loader/Loader';
import styles from './UserProfile.module.css';

const UserProfile = () => {
  const { data: userData, isLoading, error } = useUserProfile();
  const updateProfile = useUpdateProfile();
  const { register, handleSubmit, formState: { errors } } = useForm();

  if (isLoading) return <Loader />;
  if (error) return <div>Error loading profile</div>;

  const user = userData?.data;

  const onSubmit = async (data) => {
    await updateProfile.mutateAsync(data);
  };

  return (
    <Card padding="lg" className={styles.card}>
      <h2 className={styles.title}>Profile Settings</h2>
      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <div className={styles.formGroup}>
          <label>Name</label>
          <input {...register('name', { required: 'Name is required' })} defaultValue={user.name} />
        </div>
        <div className={styles.formGroup}>
          <label>Email</label>
          <input value={user.email} disabled />
        </div>
        <div className={styles.formGroup}>
          <label>Phone</label>
          <input {...register('phone')} defaultValue={user.phone} />
        </div>
        <Button type="submit" variant="primary" loading={updateProfile.isPending}>
          Update Profile
        </Button>
      </form>
    </Card>
  );
};

export default UserProfile;