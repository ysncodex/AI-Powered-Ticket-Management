import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import useAuthStore from '../features/auth/authStore';
import { createTicket } from '../features/tickets/ticketApi';
import { ArrowLeft, Send, AlertCircle, CheckCircle2, Info, Lock } from 'lucide-react';

const CreateTicket = () => {
  const { user } = useAuthStore();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Check if user is restricted
  if (user?.restricted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex items-center justify-center p-4">
        <div className="max-w-md text-center">
          <div className="inline-block p-4 bg-red-100 rounded-full mb-6">
            <Lock className="w-12 h-12 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Account Restricted</h1>
          <p className="text-slate-600 mb-6">
            Your account has been restricted. You can only view your profile and existing tickets.
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Set up the React Query Mutation
  const mutation = useMutation({
    mutationFn: createTicket,
    onSuccess: () => {
      // Invalidate the cache so the dashboard immediately fetches the new ticket
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      navigate('/dashboard'); // Send them back to the dashboard
    },
    onError: (err) => {
      setError(err.response?.data?.message || 'Failed to submit ticket.');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    mutation.mutate({ title, description });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-2xl mx-auto p-6 md:p-10">
        {/* Header */}
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors mb-8 font-medium group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to
          Dashboard
        </button>

        <div className="mb-10">
          <div className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full mb-3 tracking-wider">
            CREATE NEW TICKET
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Submit a Support Request</h1>
          <p className="text-slate-600 text-lg">
            Describe your issue in detail and our AI system will automatically categorize and
            prioritize it.
          </p>
        </div>

        {/* Progress indicator */}
        <div className="mb-8 flex items-center gap-4">
          <div className="flex-1 h-0.5 bg-blue-600"></div>
          <span className="text-xs font-semibold text-blue-600 uppercase px-3">Step 1 of 1</span>
          <div className="flex-1 h-0.5 bg-slate-200"></div>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 md:p-10">
          {error && (
            <div className="mb-6 p-4 bg-red-50 flex items-start gap-3 rounded-lg border border-red-200">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-900">Error Submitting Ticket</p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label className="block text-sm font-bold text-slate-900 mb-3 uppercase tracking-wider">
                Subject Line *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Cannot log in to my account"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400 text-slate-900 font-medium"
                maxLength={200}
              />
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-slate-500">{title.length}/200 characters</p>
                {title.trim().length > 0 && title.trim().length < 5 && (
                  <span className="text-xs text-amber-600 font-bold">
                    ⚠️ Minimum 5 characters required
                  </span>
                )}
                {title.trim().length >= 5 && (
                  <span className="text-xs text-green-600 font-bold">✓ Good</span>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-900 mb-3 uppercase tracking-wider">
                Detailed Description *
              </label>
              <textarea
                required
                rows="8"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Please describe: (1) What you were trying to do, (2) What happened, (3) Any error messages you received, (4) Steps to reproduce"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400 resize-none text-slate-900 font-medium"
                maxLength={5000}
              />
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-slate-500">{description.length}/5000 characters</p>
                {description.trim().length > 0 && description.trim().length < 10 && (
                  <span className="text-xs text-amber-600 font-bold">
                    ⚠️ Minimum 10 characters required
                  </span>
                )}
                {description.trim().length >= 10 && (
                  <span className="text-xs text-green-600 font-bold">✓ Good</span>
                )}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-blue-900">AI-Powered Triage</p>
                <p className="text-sm text-blue-700">
                  Our system will automatically categorize and prioritize your ticket for faster
                  resolution.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-slate-200">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="px-6 py-3 text-slate-600 hover:text-slate-900 font-semibold transition-all rounded-lg hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={
                  mutation.isPending || title.trim().length < 5 || description.trim().length < 10
                }
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg active:scale-95"
                title={
                  title.trim().length < 5
                    ? 'Title must be at least 5 characters'
                    : description.trim().length < 10
                      ? 'Description must be at least 10 characters'
                      : ''
                }
              >
                {mutation.isPending ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Ticket</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Success Message After Submission */}
        {mutation.isSuccess && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <div>
              <p className="font-semibold text-green-900">Ticket Submitted Successfully!</p>
              <p className="text-sm text-green-700">
                You'll be redirected to your dashboard shortly.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default CreateTicket;
